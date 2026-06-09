$port = "8080"
$folder = $PSScriptRoot

# This ensures the listener is fresh
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Server started! Keep this window open." -ForegroundColor Green
    Write-Host "Listening at http://localhost:$port/" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $path = $request.Url.LocalPath
        if ($path -eq "/signup" -and $request.HttpMethod -eq "POST" -or $request.HttpMethod -eq "GET") {
            $response.StatusCode = 200
            $msg = [System.Text.Encoding]::UTF8.GetBytes("User Saved404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        if ($path -eq "/") { $path = "/index.html" }
        
        $filePath = Join-Path $folder $path.TrimStart("/")
        
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $message = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($message, 0, $message.Length)
        }
        $response.Close()
    }
}
catch {
    Write-Error "Failed to start server..."
}