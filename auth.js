web3 = new Web3(web3.currentProvider);
var contract = new web3.eth.Contract(abi, address);
console.log("blockchain connected")

 function authenticate(account,signature)
{
    console.log(account,' -> ',signature)
      contract.methods.isRegisteredFor2F(account).call().then(function (flag) {
            console.log("isRegistered : " + flag);
            if (flag) {
                contract.methods.Auth2F(account,signature).call().then(function (flag1) {
                    if(flag1)
                    {
                        //send to main page
                        console.log('success 2F')
                        window.open('index.html', "_self")
                    }
                    else
                    {
                        alert('wrong key')
                    }
                });
            }
            else
            {
                contract.methods.registerFor2F(signature).send({ from: account });
                
            }
        });
}
