web3 = new Web3(web3.currentProvider);
var contract = new web3.eth.Contract(abi, address);
console.log("blockchain connected")

$(document).ready(function () {

var amount = "<div class=\"mb-3\" id=\"_quantitylabel1\"><label for=\"exampleInputPassword1\" class=\"form-label\">Enter Amount to be paid </label><input type=\"text\" class=\"form-control\" id=\"_p2\"></div>"
var make_payment = 	"<div class=\"mb-3\" id=\"_quantitylabel1\"><label for=\"exampleInputPassword1\" class=\"form-label\">Enter Address to which payment is to be made </label><input type=\"text\" class=\"form-control\" id=\"_p1\"></div><button type=\"submit\" class=\"btn btn-primary\" id=\"_addCarrierBtn1\" onclick=\"payment("+"document.getElementById('_p1').value"+","+ "document.getElementById('_p2').value" + ")\">Pay</button>"
$("#payments").append(make_payment);
$("#amounts").append(amount);


	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];

		// // Fetching total number of order.
		contract.methods.getTotalOrder(account).call().then(function (totalOrder) {
			console.log("totalOrder : " + totalOrder);
			// $("#_track").html(totalOrder);
            		// Fetching all products.
		contract.methods.getTotalOrder().call().then(function (totalOrder) {
			console.log("totalOrder (global) : " + totalOrder);

			for (var index = 1; index <= totalOrder; index++) {
				contract.methods.orders(index).call().then(function (orderDetails) {          
                        // console.log(orderDetails)
                        if(orderDetails[7] == accounts)
                        {
                            // var btn = "<button type=\"submit\" class=\"btn btn-primary\" id=\"_addCarrierBtn\" onclick=\"change_status("+index+")\">Deliver</button>"
                            var row = "<tr><th scope=\"row\">" + orderDetails[0] + "</th><td>" + orderDetails[1] + "</td><td>" + orderDetails[2] + "</td><td>"+ orderDetails[3] + "</td><td>"+ orderDetails[4] + "</td><td>"+ orderDetails[5] + "</td><td>" +"</td></tr>";
                            $("#_order_table").find('tbody').append(row);
                        }
				});
			}
            var carrier_update = 	"<div class=\"mb-3\" id=\"_quantitylabel\"><label for=\"exampleInputPassword1\" class=\"form-label\">Enter OrderID to be shipped</label><input type=\"text\" class=\"form-control\" id=\"_p\"></div><button type=\"submit\" class=\"btn btn-primary\" id=\"_addCarrierBtn\" onclick=\"change_status("+"document.getElementById('_p').value"+","+ "" + ")\">Ship Order</button>"
		    $("#update_carrier").append(carrier_update);
        });
	  });

	});








// --------------------------------------------------------Payment Settlement ---------------------------------------------------------------------------------------


web3.eth.getAccounts().then(function (accounts) {
    var account = accounts[0];
    contract.methods.totalOrder().call().then(function (totalOrder) {
       console.log('OrderCount : '+totalOrder)
   
        for (var index = 1; index <= totalOrder; index++) {
            
            contract.methods.getCarrierNextPendingOrderById(account,index).call().then(function (output) {          
                    if(output[0]!=-1)
                    {
                            var row = "<tr><th scope=\"row\">" + output[0] + "</th><td>" + output[1] + "</td><td>"+"</td></tr>";
                            $("#_order_table1").find('tbody').append(row);
                    }
            });   
        }
    });
 });









});
function change_status(idx)
{
    web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
		
        contract.methods.orders(idx).call().then(function (orderDetails) { 
            console.log(orderDetails[7] == account)

            //use send to make msg.send =  curr address otherwise it takes address of contract initiator
                contract.methods.updateByCarrier(idx,account).send({from:account}).then(function (res) {
                    // console.log(res)
                });
          
        });

        contract.methods.orders(idx).call().then(function (orderDetails) { 
          console.log(orderDetails);
        });


    });
}



function payment(account_to_be_paid,amount)
{
    web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
       web3.eth.sendTransaction({
         from: account,
         to: account_to_be_paid,
         value: web3.utils.toWei(amount, 'ether'),
           gas:200000
      },function(err,res)
       {
	     if(!err)
            alert('Transaction Successful')
        else
            alert('Transaction Failed')
       });
    });
}
