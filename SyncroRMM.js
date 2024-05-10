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
// Consume syncro alert via Webhook


let body = PD.inputRequest.body;
let emitEvent = true;
let severity = "warning";
let trigger = body.attributes.properties.trigger;


// Define location if it exists
let location;
if (typeof body.attributes.customer.business_name !== 'undefined') {
    location = body.attributes.customer.business_name;
} else {
    location = body.attributes.computer_name;
}


// Set Severity based on trigger type
switch (trigger) {
    case "agent_offline_trigger":
        severity = "critical";
        trigger = "Server offline";
        break;
    case "Intel Rapid Storage Monitoring":
        if (body.attributes.formatted_output.includes("Volume RAIDVOL: Verification and repair in progress.")) {severity = "error";}
        break;
    case "Oracle Authentication Error":
    case "Low Hd Space Trigger":
        severity = "error";
        break;
    case "CPU Monitoring":
    case "Ram Monitoring":
        severity = "warning";
        break;
    case "Dell Server Administrator":
        severity = "info";
        if (!body.attributes.formatted_output.includes("critical")) {emitEvent = false;}
        break;
}


// Clear irrelevant alerts
const irrelevantTriggers = ["ps_monitor", "Firewall", "IPv6"];
if (irrelevantTriggers.includes(trigger) || 
    body.attributes.formatted_output === "This process was not running: KDSDisplay" ||
    body.attributes.formatted_output === "This service was not running: givexSV") {
    emitEvent = false;
}


// Define the event payload
const cef_event = {
    event_action: PD.Trigger,
    description: "Client IP conflict detected: P1018-Fort_Saskatchewan",
    //trigger + ": " + body.attributes.computer_name,
    severity: severity,
    source_origin: location,
    details: {
        asset: body.attributes.computer_name,
        location: location,
        body: body.attributes.formatted_output,
        link: body.link,
    }
};


// Emit the payload
if (emitEvent) {
    PD.emitCEFEvents([cef_event]);
}
