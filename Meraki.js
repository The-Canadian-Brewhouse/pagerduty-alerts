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
    if (body.alertData.ip.includes(".126") ||
        body.alertData.ip.includes(".190") ||
        body.alertData.ip.includes(".222")) {
      emitEvent = false;
    }
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