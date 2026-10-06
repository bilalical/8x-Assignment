param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("userPromptSubmitted", "agentStop", "sessionEnd")]
    [string]$Event
)

$ErrorActionPreference = "Stop"

function Get-UtcTimestamp {
    param([Parameter(Mandatory = $true)]$Value)

    if ($Value -is [string]) {
        return ([DateTimeOffset]::Parse($Value).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"))
    }

    return [DateTimeOffset]::FromUnixTimeMilliseconds([long]$Value).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

function Get-TextFromContent {
    param($Value)

    if ($Value -is [string]) {
        return $Value
    }

    if ($Value -is [array]) {
        $parts = foreach ($part in $Value) {
            if ($part -is [string]) {
                $part
            }
            elseif ($null -ne $part.text -and $part.text -is [string]) {
                $part.text
            }
            elseif ($null -ne $part.content) {
                Get-TextFromContent -Value $part.content
            }
        }
        return ($parts -join "")
    }

    if ($null -ne $Value.text -and $Value.text -is [string]) {
        return $Value.text
    }

    if ($null -ne $Value.content) {
        return Get-TextFromContent -Value $Value.content
    }

    return ""
}

function Get-TranscriptMessages {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Copilot transcript does not exist: $Path"
    }

    $messages = [System.Collections.Generic.List[object]]::new()
    foreach ($line in [System.IO.File]::ReadLines($Path)) {
        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        $record = ConvertFrom-Json -InputObject $line -ErrorAction Stop
        $role = [string]$record.role
        if (-not $role) {
            $role = [string]$record.type
        }

        $message = $record.message
        if (-not $role -and $null -ne $message) {
            $role = [string]$message.role
            if (-not $role) {
                $role = [string]$message.type
            }
        }

        if ($role -match "assistant") {
            $content = Get-TextFromContent -Value $record.content
            if (-not $content -and $null -ne $message) {
                $content = Get-TextFromContent -Value $message.content
            }
            if (-not $content -and $null -ne $record.data) {
                $content = Get-TextFromContent -Value $record.data.content
            }

            if (-not [string]::IsNullOrEmpty($content)) {
                $model = [string]$record.model
                if (-not $model -and $null -ne $message) {
                    $model = [string]$message.model
                }
                if (-not $model -and $null -ne $record.data) {
                    $model = [string]$record.data.model
                }

                $messages.Add([PSCustomObject]@{
                    Content = $content
                    Model   = $model
                })
            }
        }
    }

    return $messages
}

$inputReader = [System.IO.StreamReader]::new(
    [Console]::OpenStandardInput(),
    [System.Text.UTF8Encoding]::new($false),
    $true
)
$hookInput = $inputReader.ReadToEnd()
$inputReader.Dispose()
if ([string]::IsNullOrWhiteSpace($hookInput)) {
    throw "Copilot supplied an empty $Event hook payload."
}

$payload = ConvertFrom-Json -InputObject $hookInput -ErrorAction Stop
$sessionId = [string]$payload.sessionId
if (-not $sessionId) {
    $sessionId = [string]$payload.session_id
}
if (-not $sessionId) {
    throw "The $Event hook payload has no session ID."
}

$safeSessionId = $sessionId -replace "[^A-Za-z0-9_-]", "_"
$repoRoot = (Get-Location).Path
$logDirectory = Join-Path $repoRoot ".agent-logs"
$stateDirectory = Join-Path ([System.IO.Path]::GetTempPath()) "8x-assignment-agent-capture\$safeSessionId"
$sessionStatePath = Join-Path $stateDirectory "session.json"

if ($Event -eq "userPromptSubmitted") {
    if ($null -eq $payload.prompt -or $payload.prompt -isnot [string]) {
        throw "The userPromptSubmitted hook payload has no string prompt."
    }

    New-Item -ItemType Directory -Path $stateDirectory -Force | Out-Null
    $existingLogs = @(Get-ChildItem -LiteralPath $logDirectory -Filter "*_$safeSessionId.md" -File -ErrorAction SilentlyContinue)
    if ($existingLogs.Count -gt 1) {
        throw "Multiple session logs already exist for session $sessionId."
    }

    $promptTimestamp = Get-UtcTimestamp -Value $payload.timestamp
    if (Test-Path -LiteralPath $sessionStatePath -PathType Leaf) {
        $sessionStateJson = [System.IO.File]::ReadAllText($sessionStatePath, [System.Text.Encoding]::UTF8)
        $sessionState = ConvertFrom-Json -InputObject $sessionStateJson -ErrorAction Stop
        $logFileName = [string]$sessionState.LogFileName
        if (-not $logFileName) {
            throw "The session capture state has no log file name: $sessionStatePath"
        }
    }
    elseif ($existingLogs.Count -eq 1) {
        $logFileName = $existingLogs[0].Name
    }
    else {
        $promptDate = [DateTimeOffset]::Parse($promptTimestamp).ToUniversalTime()
        $logFileName = "{0}_{1}.md" -f $promptDate.ToString("yyyy-MM-dd_HH-mm-ss"), $safeSessionId
        $sessionState = [PSCustomObject]@{
            SessionId   = $sessionId
            LogFileName = $logFileName
        }
        $json = ConvertTo-Json -InputObject $sessionState -Depth 5
        [System.IO.File]::WriteAllText($sessionStatePath, $json, [System.Text.UTF8Encoding]::new($false))
    }

    $timestampKey = [DateTimeOffset]::Parse($promptTimestamp).ToString("yyyyMMdd'T'HHmmssfff'Z'")
    $pendingPath = Join-Path $stateDirectory ("{0}_{1}.json" -f $timestampKey, [guid]::NewGuid().ToString("N"))
    $pending = [PSCustomObject]@{
        SessionId   = $sessionId
        Timestamp   = $promptTimestamp
        LogFileName = $logFileName
        Prompt      = $payload.prompt
    }
    $json = ConvertTo-Json -InputObject $pending -Depth 5
    [System.IO.File]::WriteAllText($pendingPath, $json, [System.Text.UTF8Encoding]::new($false))
    exit 0
}

if ($Event -eq "sessionEnd") {
    if (Test-Path -LiteralPath $stateDirectory -PathType Container) {
        $pendingFiles = @(Get-ChildItem -LiteralPath $stateDirectory -Filter "*.json" -File | Where-Object { $_.Name -ne "session.json" })
        if ($pendingFiles.Count -eq 0) {
            Remove-Item -LiteralPath $stateDirectory -Recurse -Force
        }
    }
    exit 0
}

$pendingFiles = @(Get-ChildItem -LiteralPath $stateDirectory -Filter "*.json" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne "session.json" } |
    Sort-Object Name)
if ($pendingFiles.Count -eq 0) {
    throw "No pending prompt was recorded for session $sessionId."
}

$pendingPath = $pendingFiles[0].FullName
$pendingJson = [System.IO.File]::ReadAllText($pendingPath, [System.Text.Encoding]::UTF8)
$pending = ConvertFrom-Json -InputObject $pendingJson -ErrorAction Stop
$transcriptPath = [string]$payload.transcriptPath
if (-not $transcriptPath) {
    $transcriptPath = [string]$payload.transcript_path
}
if (-not $transcriptPath) {
    throw "The agentStop hook payload has no transcript path."
}

$messages = @(Get-TranscriptMessages -Path $transcriptPath)
if ($messages.Count -eq 0) {
    throw "No assistant response was found in the Copilot transcript: $transcriptPath"
}

$response = $messages[$messages.Count - 1]
if (-not $response.Model) {
    throw "The final assistant message in the Copilot transcript has no model name."
}

$responseTimestamp = Get-UtcTimestamp -Value $payload.timestamp
$promptTimestamp = [string]$pending.Timestamp
$promptDate = [DateTimeOffset]::Parse($promptTimestamp).ToUniversalTime()
$logPath = Join-Path $logDirectory ([string]$pending.LogFileName)
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

if (Test-Path -LiteralPath $logPath -PathType Leaf) {
    $existing = [System.IO.File]::ReadAllText($logPath, [System.Text.Encoding]::UTF8)
    $exchangeMatch = [regex]::Match($existing, "(?m)^total_exchanges: (\d+)\r?$")
    if (-not $exchangeMatch.Success) {
        throw "The existing session log has no total_exchanges metadata: $logPath"
    }

    $exchangeCount = [int]$exchangeMatch.Groups[1].Value + 1
    $existing = [regex]::Replace($existing, "(?m)^total_exchanges: \d+\r?$", "total_exchanges: $exchangeCount", 1)
    $existing = [regex]::Replace($existing, "(?m)^last_prompt_time: .+\r?$", "last_prompt_time: $promptTimestamp", 1)
    if ($existing -match "(?m)^model: (.+)\r?$" -and $Matches[1] -ne $response.Model) {
        $existing = [regex]::Replace($existing, "(?m)^model: .+\r?$", "model: multiple", 1)
    }
    [System.IO.File]::WriteAllText($logPath, $existing, [System.Text.UTF8Encoding]::new($false))
}
else {
    $header = @"
---
session_id: $sessionId
date: $($promptDate.ToString("yyyy-MM-dd"))
author: bilalical
model: $($response.Model)
tool: github-copilot-cli
project: 8x-Assignment
total_exchanges: 0
first_prompt_time: $promptTimestamp
last_prompt_time: $promptTimestamp
---

# Session Log - $($promptDate.ToString("yyyy-MM-dd"))

Session: ``$($sessionId.Substring(0, [Math]::Min(8, $sessionId.Length)))`` | Project: ``8x-Assignment`` | Author: ``bilalical``

---

"@
    [System.IO.File]::WriteAllText($logPath, $header, [System.Text.UTF8Encoding]::new($false))
    $exchangeCount = 1
    $existing = [System.IO.File]::ReadAllText($logPath, [System.Text.Encoding]::UTF8)
    $existing = [regex]::Replace($existing, "(?m)^total_exchanges: 0\r?$", "total_exchanges: 1", 1)
    [System.IO.File]::WriteAllText($logPath, $existing, [System.Text.UTF8Encoding]::new($false))
}

$entry = @"
[LOG_ENTRY type=PROMPT num=$exchangeCount session=$($sessionId.Substring(0, [Math]::Min(8, $sessionId.Length)))]
timestamp: $promptTimestamp
model: $($response.Model)

$($pending.Prompt)


[LOG_ENTRY type=RESPONSE num=$exchangeCount session=$($sessionId.Substring(0, [Math]::Min(8, $sessionId.Length)))]
timestamp: $responseTimestamp
model: $($response.Model)

$($response.Content)


"@
[System.IO.File]::AppendAllText($logPath, $entry, [System.Text.UTF8Encoding]::new($false))
Remove-Item -LiteralPath $pendingPath -Force
exit 0
