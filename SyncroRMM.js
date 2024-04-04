// Consume syncro alert via Webhook
var body = PD.inputRequest.body;

// Set Alert Priority
var priority = "Sev3";

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
        priority = "Sev1";
        break;
    case "error":
        priority = "Sev2";
        break;
    case "warning":
        priority = "Sev3";
        break;
    case "info":
        priority = "Sev4";
        break;
}

// If alert is resolved, then append description with "resolved"
var resolved = body.attributes.resolved;
var description = (resolved == "True") ? "Resolved: " + body.attributes.properties.description : body.attributes.properties.description;


// Format payload
var cef_event = {
    event_type: PD.Trigger,
    description: description,
    severity: severity,
    priority: priority,
    source_origin: "Syncro RMM",
    dedup_key: body.attributes.id.toString(),
    service_group: body.attributes.customer.id.toString(),
    event_action: PD.Trigger,
    details: {
        alert_text: body.text,
        alert_html: body.html,
        link: body.link,
        alert_attributes: body.attributes
    }
};

PD.emitCEFEvents([cef_event]);