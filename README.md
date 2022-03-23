# AWS Route53 Dynamic DNS
This script will update a given DNS record in AWS with the current public IP address of the device running the script.

### Dependencies
* `aws-sdk`
* `node-fetch`
* An AWS account with access credentials configured for environment the script will run in.

### References
* [Crons on Raspberry Pi](https://bc-robotics.com/tutorials/setting-cron-job-raspberry-pi/)
* [AWS Node SDK](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html)
* [DDNS Example from Anthony Heddings](https://gist.github.com/anthonyheddings/f22967967bbf524ed510c356678b2651)
* [AWS Javascript Route53 SDK Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Route53.html)
