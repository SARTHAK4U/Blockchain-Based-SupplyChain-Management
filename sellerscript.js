
// connecting to contract through web3
web3 = new Web3(web3.currentProvider);
var contract = new web3.eth.Contract(abi, address);
console.log("blockchain connected")



// Jquery detects state of readiness
$(document).ready(function () {

	var amount = "<div class=\"mb-3\" id=\"_quantitylabel1\"><label for=\"exampleInputPassword1\" class=\"form-label\">Enter Amount to be paid </label><input type=\"text\" class=\"form-control\" id=\"_p2\"></div>"
	var make_payment = 	"<div class=\"mb-3\" id=\"_quantitylabel1\"><label for=\"exampleInputPassword1\" class=\"form-label\">Enter Address to which payment is to be made </label><input type=\"text\" class=\"form-control\" id=\"_p1\"></div><button type=\"submit\" class=\"btn btn-primary\" id=\"_addCarrierBtn1\" onclick=\"payment("+"document.getElementById('_p1').value"+","+ "document.getElementById('_p2').value" + ")\">Pay</button>"
	$("#payments").append(make_payment);
	$("#amounts").append(amount);

	$("#_updatebtn").hide();
	$("#_addbtn").hide();

	// Show / hide register section.
	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0]; // caller account of metamask
		contract.methods.isRegistered(account).call().then(function (flag) {
			console.log("isRegistered : " + flag);
			if (flag) {
				$("#_regdiv").hide();
				$("#_addbtn").show();
			}
		});
	});


	// Fetching products.
	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];

		// Total my product
		contract.methods.getTotalProduct(account).call().then(function (totalProduct) {
			console.log("totalProduct my : " + totalProduct);
			$("#_totalproduct").html(totalProduct);
		});


		// Fetch my products.
		contract.methods.getTotalProduct().call().then(function (totalProduct) {
			console.log("totalProduct (global): " + totalProduct);

			var index = 1;
			for (index = 1; index <= totalProduct; index++) {
				contract.methods.getNextProduct(account, index).call().then(function (productDetails) {
					// index = productDetails + 1;
					console.log(productDetails);
					if (productDetails[4]) {
						var row = "<tr><th>" + productDetails[0] + "</th><td>" + productDetails[3] + "</td><td>" + productDetails[1] + "</td><td>" + productDetails[2] + "</td><td><button type=\"button\" class=\"btn btn-secondary btn-sm\" onclick=\"priceUpdate(" + productDetails[0] + ")\">Change price</button></td></tr>";
						$("#_myproduct_table").find('tbody').append(row);
					}
				});
			}

		});


		// Fetching total number of my product.
		contract.methods.getMyTotalOrder(account).call().then(function (totalOrder) {
			console.log("totalOrder my : " + totalOrder);
			$("#_total_order").html(totalOrder);

		});

		// Fetch my orders.
		contract.methods.getTotalOrder().call().then(function (totalOrder) {
			console.log("totalOrder (global): " + totalOrder);
			var idx = 1;
			for (idx = 1; idx <= totalOrder; idx++) {
				contract.methods.getMyNextOrderById(account, idx).call().then(function (orderDetails) {
					// index = orderDetails + 1;
					console.log(orderDetails);


					if (orderDetails[6]) {
						index = orderDetails[0]
						var carrier_update = 	"<div class=\"mb-3\" id=\"_quantitylabel"+index+"\"><input type=\"text\" placeholder=\"Enter Carrier Address\" class=\"form-control\" id=\"_p"+index+"\"></div><button type=\"submit\" class=\"btn btn-primary\" id=\"_addCarrierBtn"+index+"\"  onclick=\"add_carrier("+"document.getElementById('_p"+index+"').value"+","+ orderDetails[0] + ")\">Add Carrier</button>"
						console.log(index)
						console.log(carrier_update)
						var row = "<tr><th>" + orderDetails[0] + "</th><td>" + orderDetails[1] + "</td><td>" + orderDetails[2] + "</td><td>" + orderDetails[3] + "</td><td>" + orderDetails[5] +  "</td>"+ "<td>"+orderDetails[4]+"</td>"+"<td>"+carrier_update+"</td>"+"</tr>";
						$("#_order_table").find('tbody').append(row);
					}
				});
			}
		});


	});

	// Register new producer.
	$("#_regbutton").click(function () {
		web3.eth.getAccounts().then(function (accounts) {
			var account = accounts[0];
			var name = $("#_regname").val();

			return contract.methods.reginsterProducer(name).send({ from: account });
		}).then(function (trx) {
			console.log(trx);
			if (trx.status) {
				$("#_regdiv").hide();
				$("#_addbtn").show();
			}
		});
	});

	// Adding new product.
	$("#_addbtn").click(function () {
		web3.eth.getAccounts().then(function (accounts) {
			var account = accounts[0];
			var pname = $("#_pname").val();
			var pprice = $("#_price").val();
			var pquantity = $("#_pquantity").val();
			console.log(pname + pprice + pquantity);

			return contract.methods.addProduct(pname, pprice, pquantity).send({ from: account });
		}).then(function (trx) {
			console.log(trx);
			if (trx.status) {
				alert("Product added!");
				$("#_pname").val("");
				$("#_price").val("");
				$("#_pquantity").val("");
				location.reload();
			}
		});
	});

	// Update the price of a product.
	$("#_updatebtn").click(function () {
		web3.eth.getAccounts().then(function (accounts) {
			var account = accounts[0];
			var pid = $("#_pname").val();
			var pprice = $("#_price").val();
			console.log("update button click " + pid + pprice);

			return contract.methods.updatePrice(pid, pprice).send({ from: account });
		}).then(function (trx) {
			console.log(trx);
			if (trx.status) {
				alert("Price updated!");
				$("#_nameidlabel").html("Name");
				$("#_pricelabel").html("Price");
				$("#_quantitylabel").show();
				$("#_addbtn").show();
				$("#_updatebtn").hide();
				$("#_pname").val('');
				$("#_price").val('');
				location.reload();
			}
		});
	});


});

// Add Carrier

function add_carrier(adrs,orderId) {
	console.log("address " + adrs+" OrderID "+orderId);
	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
		var status = "Passed To Carrier";
		return contract.methods.updateOrderStatus(orderId, status, adrs).send({ from: account });
	}).then(function (trx) {
		console.log(trx);
		if (trx.status) {
			alert("Order Passed to carrier successfully");
			location.reload();
		}
	});
}



// Reject order.
function reject(orderId) {
	console.log("Reject " + orderId);

	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
		var status = "Rejected";                       
	    return contract.methods.orders(orderId).call().then(function(order){console.log(order.carrier_address);return order.carrier_address}).then(

              function(carrier)
			  {
				console.log(carrier)
				return contract.methods.updateOrderStatus(orderId, status,carrier).send({ from: account });
			  }

		);
	}).then(function (trx) {
		console.log(trx);
		if (trx.status) {
			alert("Order rejected!");
			location.reload();
		}
	});
}

// Delivered order.
function delivered(orderId) {
	console.log("Deliver" + orderId);

	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
		var status = "Delivered";                       
	    return contract.methods.orders(orderId).call().then(function(order){console.log(order.carrier_address);return order.carrier_address}).then(

              function(carrier)
			  {
				console.log(carrier)
				return contract.methods.updateOrderStatus(orderId, status,carrier).send({ from: account });
			  }

		);
	}).then(function (trx) {
		console.log(trx);
		if (trx.status) {
			alert("Order Delivered!");
			location.reload();
		}
	});
}

// Add the product details in from for price update.
function priceUpdate(productId) {
	console.log("order click : " + productId);
	// alert(productId);

	$("#_nameidlabel").html("Product ID");
	$("#_pricelabel").html("New price");
	$("#_quantitylabel").hide();
	$("#_addbtn").hide();
	$("#_updatebtn").show();
	$("#_pname").val(productId);
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
	// --------------------------------------------------------Payment Settlement ---------------------------------------------------------------------------------------


web3.eth.getAccounts().then(function (accounts) {
    var account = accounts[0];
    contract.methods.totalOrder().call().then(function (totalOrder) {
       console.log('OrderCount : '+totalOrder)
   
        for (var index = 1; index <= totalOrder; index++) {
            
            contract.methods.getSellerNextPendingOrderById(account,index).call().then(function (output) {          
                    if(output[0]!=-1)
                    {
						console.log('hi')
                            var row = "<tr><th scope=\"row\">" + output[0] + "</th><td>" + output[1] + "</td><td>"+"</td></tr>";
                            $("#_order_table1").find('tbody').append(row);
                    }
            });   
        }
    });
 });













