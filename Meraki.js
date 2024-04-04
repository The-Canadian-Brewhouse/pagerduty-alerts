// Consume syncro alert via Webhook
var body = PD.inputRequest.body;

// If alert is resolved, then append description with "resolved"
var resolved = body.attributes.resolved;
var description = (resolved == "true") ? "Resolved: " + body.attributes.properties.description : body.attributes.properties.description;

// Set Alert Priority
var priority = "sev3";

// Set Alert Severity
var severity = "warning";
// critical
// error
// warning
// info
// unknown

if (body.attributes.properties.trigger == "agent_offline_trigger") { severity = "critical"; }
if (body.attributes.properties.trigger == "Intel Rapid Storage Monitoring" && body.attributes.formatted_output.includes("Volume RAIDVOL: Verification and repair in progress.")) { 
    severity = "error"; 
}
if (body.attributes.properties.trigger == "CPU Monitoring") { severity = "warning"; }


// Set priority based on severity
switch (severity) {
    case "critical":
        priority = "sev1";
        break;
    case "error":
        priority = "sev2";
        break;
    case "warning":
        priority = "sev3";
        break;
    case "info":
        priority = "sev4";
        break;
}

// Define event type based on resolution status
var eventType = (resolved == "true") ? PD.Resolve : PD.Trigger;

// Define the event payload
var cef_event = {
    event_type: eventType,
    event_action: eventType,
    description: description,
    severity: severity,
    priority: priority,
    source_origin: body.attributes.computer_name,
    dedup_key: body.attributes.id.toString(),
    service_group: body.attributes.customer.id.toString(),
    details: {
        asset: body.attributes.computer_name,  
        alert_text: body.text,
        link: body.link
    }
};

// Emit the event
PD.emitCEFEvents([cef_event]);
