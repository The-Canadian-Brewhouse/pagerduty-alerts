// Assign variables
let body = PD.inputRequest.body;
let emitEvent = true;
let severity = "warning";
let trigger = body.attributes.properties.trigger;
let computerName;
let location;

// Date logic, gets the date and then uses it to ignore alerts between certain times.
// Gets the offset from the input date (in minutes) and converts it to milliseconds
// Mountain Time is UTC-7 in Standard Time, and UTC-6 in Daylight Saving Time
// Assume it's MDT (UTC-6) for simplicity, or adjust dynamically if needed
const date = new Date(body.attributes.updated_at);
const timezoneOffset = date.getTimezoneOffset() * 60000;
const utcTime = date.getTime() + timezoneOffset;
const mountainOffset = 6 * 60 * 60000; // 6 hours offset in milliseconds
const mountainTime = new Date(utcTime - mountainOffset);


// Assign computerName and location if they exist
if (typeof body.attributes.computer_name !== 'undefined') {
    computerName = body.attributes.computer_name;
} else {
    computerName = "Unknown Device";
}
if (typeof body.attributes.customer.business_name !== 'undefined') {
    location = body.attributes.customer.business_name;
} else {
    location = computerName;
}


// Set Severity and rename trigger based on trigger type
switch (trigger) {
  case "agent_offline_trigger":
    severity = "critical";
    trigger = "Server offline";
    // Ignore server outages from 2am to 8am Mountain Time
    if (mountainTime.getHours() >= 2 && mountainTime.getHours() < 8) {
        emitEvent = false;
    }
    break;
  case "Intel Rapid Storage Monitoring":
    severity = "error";
    trigger = "RAID Volume Degraded";
    if (body.attributes.formatted_output.includes("2 new event matches triggered")) {
      if (body.attributes.formatted_output.includes("Service started successfully.") ||
          body.attributes.formatted_output.includes("Service has been successfully shut down.") &&
          body.attributes.formatted_output.includes("Started event manager")) {
        emitEvent = false;
      }
    }
    break;
  case "Oracle Authentication Error":
    severity = "error";
    break;
  case "low_hd_space_trigger":
    severity = "error";
    trigger = "Low Disk Space";
    break;
  case "CPU Monitoring":
  case "Ram Monitoring":
    severity = "warning";
    break;
  case "Dell Server Administrator":
    severity = "info";
    if (!(body.attributes.formatted_output.includes("critical"))) {
      emitEvent = false;
    }
    break;
  // Clear irrelevant alerts
  case "ps_monitor":
  case "Firewall":
  case "IPv6":
  case "Powered Off VM":
  case "Service tag capture":
    emitEvent = false;
    break;
}


// Auto resolution logic, will attempt to close existing alerts if one comes in with "Auto resolved" in the description.
let resolved = body.attributes.resolved;
let description = body.attributes.properties.description;
if (description.toLowerCase().includes("auto resolved")) {
    resolved = "true";
}

// Define event type based on resolution status
let eventType;
if (resolved === "true") {
    eventType = PD.Resolve;
} else {
    eventType = PD.Trigger;
}


// Define the event payload
var normalized_event = {
    event_action: eventType,
    event_type: eventType,
    description: trigger + ": " + computerName,
    severity: severity,
    source_origin: location,
    incident_key: body.attributes.id,
    dedup_key: body.attributes.id,
    details: {
        asset: computerName,
        location: location,
        body: body.attributes.formatted_output,
        link: body.link,
        resolved: resolved,
    }
};

// Emit the event payload
if (emitEvent) {
    PD.emitCEFEvents([normalized_event]);
}
