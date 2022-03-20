import AWS from "aws-sdk";
import fetch from "node-fetch";

const startTime = Date.now();

const hostedZoneId = "Z053714219PX4UM0O128N";
const hostname = "home.wolfpea.ch";

const route53 = new AWS.Route53({apiVersion: '2013-04-01'});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function getCurrentIp() {
    console.log("Fetching current IP...");
    const response = await fetch("http://checkip.amazonaws.com/");
    const ip = (await response.text()).trim();
    if (validateIp(ip)) {
        console.log(ip);
        return ip;
    }
    console.error("Fetching current IP failed. Response: ", response);
    return false;
}

async function getIpFromDnsRecord() {
    console.log("Fetching value currently set in DNS record...");
    const params = {
        HostedZoneId: hostedZoneId,
        StartRecordName: hostname,
        StartRecordType: "A",
        MaxItems: "2"
    }
    const recordSets = await route53.listResourceRecordSets(params).promise();
    for (let record of recordSets["ResourceRecordSets"]) {
        if (record["Name"] == hostname + ".") {
            if (record["ResourceRecords"].length == 1) {
                const ip = record["ResourceRecords"][0]["Value"];
				if (validateIp(ip)) {
				    console.log("DNS Record IP ", ip);
				    return ip;
			    } else {
				    console.error("Something went wrong");
				    return false;
			    }
		    }
	    }
	}
}

async function setIpInDnsRecord(ip) {
    console.log(`Updating DNS record for ${hostname} to ${ip}`);
    const date = new Date();
    const params = {
	    ChangeBatch: {
		    Changes: [{
			    Action: "UPSERT",
			    ResourceRecordSet: {
				    Name: hostname,
				    ResourceRecords: [
					    { Value: ip }
				    ],
				    TTL: 300,
				    Type: "A"
			    }
			}],
			Comment: `Updated IP address on ${date.toString()}` 
        },
		HostedZoneId: hostedZoneId
	};
	const result = await route53.changeResourceRecordSets(params).promise();
	console.log("DNS Updated. Can take up to 60s to propogate");
}

function validateIp(ipString) {
	const re = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
	return !!ipString.match(re);
}

async function main() {
	console.log("Starting DDNS process...");
	await sleep(100);

	const ip = await getCurrentIp();
	if (!ip) {
		console.error("An error occurred getting current IP");
		return 1;
	}

	const oldIp = await getIpFromDnsRecord();
	if (!oldIp) {
		console.error("An error occurred fetching DNS record");
		return 1;
	}

	if (ip == oldIp) {
		console.log("IP address is still the same. No action required");
	} else {
		console.log("IP address has changed!");
		await setIpInDnsRecord(ip);
	}

	const endTime = Date.now();
	const timeTaken = endTime - startTime;
	console.log(`Completed in ${timeTaken}ms`);
	return 0;
}

main();
