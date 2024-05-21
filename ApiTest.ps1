$body = @{
    "customer_id" = 28403996
    "asset_id" = 8689539
    "computer_name" = "P29WS01"
    "description" = "This is a test alert sent via the syncro api"
    "resolved" = $false
    "status" = "status"
    "properties" = @{
        "subject" = "test alert"
        "body" = "test alert"
        "sms_body" = "This is a test alert sent via the syncro api"
    }
}


$parameters = @{
    Headers = @{
        "Authorization" = "Tacc429758d2e38fe4-41d01abe7f3e532d00bf08fb144fcfc6"
    }
    Method = 'POST'
    Uri = 'https://tcbh.syncromsp.com/api/v1/rmm_alerts'
    Body = (ConvertTo-Json $body)
    ContentType = 'application/json'
}

Invoke-RestMethod @parameters
