// Consume syncro alert via Webhook
var body = PD.inputRequest.body;

// If alert is resolved, then append description with "resolved"
var description = body.attributes.properties.description;

// Check if "Auto Resolved" is in the description and set resolved accordingly
var resolved = body.attributes.resolved;
//if (description.toLowerCase().includes("auto resolved")) {
//    resolved = "true";
//}

// Define event type based on resolution status
//var event_action;
//if (resolved === "true") {
//    event_action = PD.Resolve;
//} else {
//    event_action = PD.Trigger;
//}

// Set Severity based on trigger type
var severity = "warning";
// critical
if (body.attributes.properties.trigger == "agent_offline_trigger") { severity = "critical"; }
// error
if (body.attributes.properties.trigger == "Intel Rapid Storage Monitoring" && body.attributes.formatted_output.includes("Volume RAIDVOL: Verification and repair in progress.")) { severity = "error"; }
if (body.attributes.properties.trigger == "Oracle Authentication Error") { severity = "error"; }
if (body.attributes.properties.trigger == "Low Hd Space Trigger") { severity = "error"; }
// warning
if (body.attributes.properties.trigger == "CPU Monitoring") { severity = "warning"; }
if (body.attributes.properties.trigger == "Ram Monitoring") { severity = "warning"; }
// info
// unknown

// Define the event payload
var cef_event = {
    event_action: PD.Trigger,
    event_type: PD.Trigger,
    description: body.attributes.properties.trigger + " : " + body.attributes.computer_name,
    severity: severity,
    source_origin: body.attributes.computer_name,
  	incident_key: body.attributes.computer_name,
    details: {
        asset: body.attributes.computer_name,
        location: body.attributes.customer.business_name,
        body: body.attributes.formatted_output,
        link: body.link,
        resolved: resolved,
    }
};

// Emit the event
PD.emitCEFEvents([cef_event]);