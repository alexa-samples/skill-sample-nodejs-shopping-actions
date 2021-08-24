## Node.js Sample Skill for Alexa Shopping Actions

This is the repository for the Alexa Shopping Actions Node.js sample. This is a basic skills that allows you to test the flow for the Add to Cart and Buy actions. 

## Alexa Skill Usage Instructions

This project is meant to be used with ASK CLI V2. There is AWS infrastructure involved and you will also need an AWS account for this. This uses the ASK CLI V2 Lambda deployer. The code is defined in the lambda directory. 

### Get this repo
If you want to run this sample, make sure you are running ASK CLI v2. For instructions on doing so and setting up an AWS IAM user for use with the CLI, see [the technical reference docs.](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html)

From your terminal, try:

`ask new --template-url https://github.com/alexa-samples/skill-sample-nodejs-alexashoppingactions --template-branch main`

Select `AWS Lambda`.

Use the defaults for each of the answers. This will set you up with the skill. From there: 

To build this sample, first build the node packages:

1. `cd lambda`
2. `npm install`
3. `cd ..`

Then you can deploy using: `ask deploy` from this directory. Note: You will need to grant the IAM role for your Lambda function access to create tables and put objects in DynamoDB.

### Clone the Git repo

If you want to make changes to this repo and have set up the skill using the previous methods, follow these instructions so you can pull the latest code when you need to or create your own pull requests.

From the top level directory, run:

 git init .

Then add the origin with:

 git remote add origin https://github.com/alexa-samples/skill-sample-nodejs-shopping-actions.git

or:

 git remote add origin git@github.com:alexa/skill-sample-nodejs-shopping-actions.git

Set the upstream to the main branch.

 git branch --set-upstream-to=origin/main 

Then, you can refresh by pulling:

 git pull

Or, if this is aborted, you can always hard reset the branch:

 git reset --hard origin/main 

Now, you can pull whenever you need to update your code. 

## Bugs?

Please open bug reports on GitHub using GitHub issues. Include the steps taken to reproduce. You can use this for suggested improvements as well. 

Feel free to fork and open a pull request if you have a fix or improvement to make, also!

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the Amazon Software License.
