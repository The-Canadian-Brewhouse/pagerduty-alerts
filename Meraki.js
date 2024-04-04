// Consume Meraki Alert via Webhook
var body = PD.inputRequest.body;

// Set Alert Severity
var severity = "warning";
// critical
// error
// warning
// info
// unknown

if(body.alertType == "Settings changed") {severity = "info";}
if(body.alertType == "Motion detected") {severity = "info";}
if(body.alertType == "Network usage alert") {severity = "warning";}
if(body.alertType == "APs went down") {severity = "critical";}
if(body.alertType == "Uplink status changed" && !body.alertData.uplink) {severity = "critical";}


// Format payload
var cef_event = {
event_type: PD.Trigger,
description: body.alertType,
severity: severity,
source_origin: body.networkId,
dedup_key: body.alertId,
service_group: body.organizationId,
event_action: PD.Trigger,
details: body
}

PD.emitCEFEvents([cef_event]);