// Consume Meraki Alert via Webhook
let body = PD.inputRequest.body;
let emitEvent = true;
let trigger = body.alertType;
let severity = "warning";

// Set Severity and rename trigger based on trigger type
switch (trigger) {
  case "Settings changed":
  case "Motion detected":
    severity = "info";
    break;
  case "Network usage alert":
  case "Client IP conflict detected":
  case "Cellular came up":
    severity = "warning";
    break;
  case "Air Marshal - Rogue AP detected":
    severity = "warning";
    if (body.alertData.ssidName.includes("DIRECT") ||
      body.alertData.ssidName.includes("Meraki") ||
      body.alertData.ssidName.includes("roku")) {
      emitEvent = false;
    }
    break;
  case "Client IP conflict detected":
    severity = "warning";
    // Clear irrelevant IP conflict alerts based on IP addresses
    if (body.alertData.conflictingIp.includes("172.") ||
        body.alertData.conflictingIp.includes("1.1.1.1") ||
        body.alertData.conflictingIp.includes("192.") ||
        body.alertData.conflictingIp.includes("10.100.80.40")) {
      emitEvent = false;
    }
    // Clear irrelevant IP conflict alerts based on MAC addresses
    var ipConflictMacBlacklist = [
      "F6:43:BB:20:E6:5A",
      "DA:18:DF:A1:0D:E2"
    ];
    if (ipConflictMacBlacklist.includes(body.alertData.contendingMac)) {emitEvent = false;}
    break;
  case "New DHCP server detected":
    severity = "warning";
    var newDHCPServerWhitelist = [
      "f8:9e:28:d8:c4:09",
      "f8:9e:28:d8:7f:19",
      "f8:9e:28:d8:97:99",
      "f8:9e:28:d8:c5:99",
      "f8:9e:28:d8:be:c9",
      "f8:9e:28:d8:c7:29",
      "f8:9e:28:d8:c3:e9",
      "f8:9e:28:72:1d:2d",
      "0c:7b:c8:c2:1f:4f",
      "f8:9e:28:d8:bb:f9",
      "c4:8b:a3:52:b4:9f",
      "c4:8b:a3:52:b6:4f",
      "c4:8b:a3:52:95:ef",
      "0c:7b:c8:c3:dc:bf",
      "0c:7b:c8:c3:b6:1f",
      "0c:7b:c8:c3:e1:bf",
      "0c:7b:c8:c3:bd:0f",
      "0c:7b:c8:c3:dd:2f",
      "0c:7b:c8:c3:ac:9f",
      "0c:7b:c8:c1:fb:9f",
      "0c:7b:c8:c2:25:cf",
      "14:9f:43:2b:36:d8",
      "14:9f:43:2b:37:88",
      "f8:9e:28:d8:b0:49",
      "f8:9e:28:72:1b:2d",
      "f8:9e:28:72:03:9d",
      "f8:9e:28:72:18:8d",
      "f8:9e:28:d8:a6:29",
      "f8:9e:28:d8:98:a9",
      "f8:9e:28:71:fb:fd",
      "f8:9e:28:d8:91:79",
      "f8:9e:28:d8:c5:f9",
      "f8:9e:28:d8:b1:d9",
      "f8:9e:28:d8:7c:29",
      "f8:9e:28:d8:9a:59",
      "f8:9e:28:d8:af:a9",
      "f8:9e:28:d8:91:99",
      "f8:9e:28:d8:b0:19",
      "f8:9e:28:d8:8b:19",
      "c4:8b:a3:52:db:2f",
      "f8:9e:28:d8:9c:49",
      "f8:9e:28:d8:a7:49",
      "f8:9e:28:d8:b2:89",
      "f8:9e:28:d8:c6:49",
      "f8:9e:28:d8:c7:59",
      "f8:9e:28:d8:ad:99",
      "f8:9e:28:d8:b9:49",
      "f8:9e:28:d8:b9:d9",
      "f8:9e:28:d8:bd:29",
      "f8:9e:28:d8:b5:09",
      ];
    if (newDHCPServerWhitelist.includes(body.alertData.mac)) {emitEvent = false;}
    break;
  case "appliances went down":
  case "appliances came up":
  case "switches went down":
  case "switches came up":
  case "APs went down":
  case "APs came up":
    severity = "critical";
    break;
  case "Uplink status changed":
    if (!body.alertData.uplink) {severity = "warning";}
    if (body.networkName = "PLD-Seton"){emitEvent = false;}
    break;

}


// Format payload
var cef_event = {
  event_type: PD.Trigger,
  description: body.alertType + ": " + body.networkName,
  severity: severity,
  source_origin: body.networkName,
  dedup_key: body.alertId,
  service_group: body.organizationId,
  event_action: PD.Trigger,
  details: body
}

if (emitEvent){PD.emitCEFEvents([cef_event]);}