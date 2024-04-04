// Consume Syncro Alert via Webhook
var body = JSON.parse(PD.inputRequest.body);
​
// Set Alert Severity
var severity = "warning";
// critical
// error
// warning
// info
// unknown
​
// Assuming that 'trigger' field determines the severity
if (body.attributes.properties.trigger == "agent_offline_trigger") { severity = "critical"; }
​
// Format payload
var cef_event = {
    event_type: PD.Trigger,
    description: "RMM Alert: " + body.attributes.formatted_output,
    severity: severity,
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
​
PD.emitCEFEvents([cef_event]);
