import {STS as sts} from 'aws-sdk'
import {IAM as iam} from 'aws-sdk'
import * as inquirer from 'inquirer'

function getInput<T>(question:string):Promise<T> 
{
    return inquirer.prompt<{value:T}>([{  
        type:    'input',
        name:    'value',
        message: question + ':'
    }])
    .then(x => x.value);
}

const runSomething = async () => 
{
    var accessKeyId = await getInput<string>('Access Key');
    var secretAccessKey = await getInput<string>('Secret Key');
    var accountNumber = await getInput<string>('Account Number');
    var userName = await getInput<string>('User Name');
    var twoFactorCode = await getInput<string>('Two Factor Code');
    var groupName = await getInput<string>('Group Name');

    var credentialChain = new sts({
        'accessKeyId'     : accessKeyId,
        'secretAccessKey' : secretAccessKey
    });

    const token = await credentialChain.getSessionToken({SerialNumber: `arn:aws:iam::${accountNumber}:mfa/${userName}`, TokenCode: twoFactorCode}).promise();

    const identityAccessManager = new iam({apiVersion: '2010-05-08'});
    const group = await identityAccessManager.getGroup({GroupName: groupName}).promise();

    var sortedUsers = group.Users.sort((a, b) => a.UserName.localeCompare(b.UserName));

    sortedUsers.map(x => console.log(x.UserName));
}

runSomething();