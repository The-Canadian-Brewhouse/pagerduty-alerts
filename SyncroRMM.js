// Consume syncro alert via Webhook
var body = PD.inputRequest.body;

// If alert is resolved, then append description with "resolved"
var description = (body.attributes.resolved == "true") ? "Resolved: " + body.attributes.properties.description : body.attributes.properties.description;

// Define event type based on resolution status
var eventType = (body.attributes.resolved == "true") ? PD.Resolve : PD.Trigger;

// Check if "Auto Resolved" is in the description and set resolved accordingly
//var resolved = "false";
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
// Set Alert Severity
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
    event_type: eventType,
    event_action: eventType,
    description: body.attributes.properties.trigger + " : " + body.attributes.computer_name,
    severity: severity,
    priority: priority,
    source_origin: body.attributes.computer_name,
    dedup_key: body.attributes.id.toString(),
    service_group: body.attributes.customer.id.toString(),
    details: {
        asset: body.attributes.computer_name,  
        alert_text: body.text,
        link: body.link,
      	resolved: body.attributes.resolved,
    }
};

// Emit the event
PD.emitCEFEvents([cef_event]);
