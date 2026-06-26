$port = 8080
$folder = $PSScriptRoot
$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css" = "text/css; charset=utf-8"
    ".js" = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png" = "image/png"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif" = "image/gif"
    ".ico" = "image/x-icon"
}

function Send-Response {
    param (
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$StatusText,
        [byte[]]$Body,
        [string]$ContentType = "text/plain; charset=utf-8"
    )

    $headers = "HTTP/1.1 $StatusCode $StatusText`r`n" +
        "Content-Type: $ContentType`r`n" +
        "Content-Length: $($Body.Length)`r`n" +
        "Connection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    $Stream.Write($Body, 0, $Body.Length)
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)

try {
    $listener.Start()
    Write-Host "Server started! Keep this window open." -ForegroundColor Green
    Write-Host "Listening at http://localhost:$port/" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

    while ($true) {
        $client = $listener.AcceptTcpClient()

        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()

            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                continue
            }

            $headers = @{}
            while ($true) {
                $headerLine = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($headerLine)) {
                    break
                }

                $separator = $headerLine.IndexOf(":")
                if ($separator -gt 0) {
                    $name = $headerLine.Substring(0, $separator).Trim().ToLowerInvariant()
                    $value = $headerLine.Substring($separator + 1).Trim()
                    $headers[$name] = $value
                }
            }

            if ($headers.ContainsKey("content-length")) {
                $bodyLength = [int]$headers["content-length"]
                if ($bodyLength -gt 0) {
                    $buffer = New-Object char[] $bodyLength
                    [void]$reader.ReadBlock($buffer, 0, $bodyLength)
                }
            }

            $parts = $requestLine.Split(" ")
            $method = $parts[0]
            $path = [System.Uri]::UnescapeDataString($parts[1].Split("?")[0])

            if ($path -eq "/signup" -and $method -eq "POST") {
                $body = [System.Text.Encoding]::UTF8.GetBytes("User Saved")
                Send-Response $stream 200 "OK" $body
                continue
            }

            if ($method -ne "GET") {
                $body = [System.Text.Encoding]::UTF8.GetBytes("405 Method Not Allowed")
                Send-Response $stream 405 "Method Not Allowed" $body
                continue
            }

            if ($path -eq "/") {
                $path = "/index.html"
            }

            $relativePath = $path.TrimStart("/") -replace "/", [System.IO.Path]::DirectorySeparatorChar
            $filePath = Join-Path $folder $relativePath
            $fullPath = [System.IO.Path]::GetFullPath($filePath)
            $rootPath = [System.IO.Path]::GetFullPath($folder)

            if ($fullPath.StartsWith($rootPath) -and (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
                $content = [System.IO.File]::ReadAllBytes($fullPath)
                $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
                $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { "application/octet-stream" }
                Send-Response $stream 200 "OK" $content $contentType
            } else {
                $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                Send-Response $stream 404 "Not Found" $body
            }
        }
        finally {
            $client.Close()
        }
    }
}
catch {
    Write-Error "Failed to start server: $($_.Exception.Message)"
}
finally {
    $listener.Stop()
}