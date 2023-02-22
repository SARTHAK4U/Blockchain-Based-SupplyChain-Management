web3 = new Web3(web3.currentProvider);
var contract = new web3.eth.Contract(abi, address);
console.log("blockchain connected")

$(document).ready(function () {

var amount = "<div class=\"mb-3\" id=\"_quantitylabel1\"><label for=\"exampleInputPassword1\" class=\"form-label\">Enter Amount to be paid </label><input type=\"text\" class=\"form-control\" id=\"_p2\"></div>"
var make_payment = 	"<div class=\"mb-3\" id=\"_quantitylabel1\"><label for=\"exampleInputPassword1\" class=\"form-label\">Enter Address to which payment is to be made </label><input type=\"text\" class=\"form-control\" id=\"_p1\"></div><button type=\"submit\" class=\"btn btn-primary\" id=\"_addCarrierBtn1\" onclick=\"payment("+"document.getElementById('_p1').value"+","+ "document.getElementById('_p2').value" + ")\">Pay</button>"
$("#payments").append(make_payment);
$("#amounts").append(amount);




	contract.methods.getTotalProduct().call().then(function (totalProduct) {
		console.log("totalProduct : " + totalProduct);
		$("#_products_table").html(totalProduct);

		for (var i = 1; i <= totalProduct; i++) {
			contract.methods.getProductById(i).call().then(function (productDetails) {
				console.log(productDetails);
				var row = "<tr><th>" + productDetails[0] + "</th><td>" + productDetails[3] + "</td><td>" + productDetails[1] + "</td><td>" + productDetails[2] + "</td><td><button type=\"button\" class=\"btn btn-secondary btn-sm\" onclick=\"productOrderClick(" + productDetails[0] + ")\">Order</button></td></tr>";
				$("#_product_table").find('tbody').append(row);
			});
		}
	});


	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];

		// Fetching total number of order.
		contract.methods.getTotalOrder(account).call().then(function (totalOrder) {
			console.log("totalOrder : " + totalOrder);
			$("#_track").html(totalOrder);
		});

		// Fetching all products.
		contract.methods.getTotalOrder().call().then(function (totalOrder) {
			console.log("totalOrder (global) : " + totalOrder);

			for (var index = 1; index <= totalOrder; index++) {
				contract.methods.fetchNextOrderById(account, index).call().then(function (orderDetails) {
					console.log(orderDetails);
					if (orderDetails[6]) {
						var carrier_update =""
						if(orderDetails[4]=="Shipped")
						   carrier_update = "<div class=\"mb-3\" id=\"_quantitylabel"+index+"\"><input type=\"text\" placeholder=\"Enter Amount Accepted\" class=\"form-control\" id=\"_p"+index+"\"></div><button type=\"submit\" class=\"btn btn-primary\" id=\"_addCarrierBtn"+index+"\"  onclick=\"accepted_qty("+"document.getElementById('_p"+index+"').value"+","+ orderDetails[0] + ")\">Accept</button>"
						var row = "<tr><th scope=\"row\">" + orderDetails[0] + "</th><td>" + orderDetails[5] + "</td><td>" + orderDetails[4] + "</td><td>"+carrier_update+"</td></tr>";
						$("#_order_table").find('tbody').append(row);
					}
				});
			}
		});


	});

	// Placing order.
	$("#_orderbtn").click(function () {
		web3.eth.getAccounts().then(function (accounts) {
			var account = accounts[0];
			var pid = $("#_pid").val();
			var quantity = $("#_quantity").val();
			var cname = $("#_cname").val();
			var caddress = $("#_caddress").val();
			console.log("place order : " + pid + quantity + cname + caddress);

			return contract.methods.placeOrder(cname, caddress, pid, quantity).send({ from: account });
		}).then(function (trx) {
			console.log(trx);
			if (trx.status) {
				alert("Order is placed!");
				$("#_pid").val("");
				$("#_quantity").val("");
				$("#_cname").val("");
				$("#_caddress").val("");
				location.reload();
			}

		});
	});





	web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
		contract.methods.totalOrder().call().then(function (totalOrder) {
		   console.log('OrderCount : '+totalOrder)
	   
			for (var index = 1; index <= totalOrder; index++) {
				
				contract.methods. getShipperNextPendingOrderById(account,index).call().then(function (output) {          
						if(output[0]!=-1)
						{
							console.log('Sarthak address : ',output[2])
						        var	adrs = output[2]
							    var btn2="<button onclick=\"generatePDF("+output[0]+")\">Generate Invoice</button>"
								var row = "<tr><th scope=\"row\">" +"<div id="+output[0]+">"+output[0] +"</div>"+"</th><td>" +"<div id= "+"pay"+output[0]+">" +output[1]+"</div>"+"</th><td>"+"<div id= "+"payadrs"+output[0]+">" +output[2]+"</div>"+ "</td><td>"+"<button type=\"submit\" class=\"btn btn-primary\" id=\"Btn1"+output[0]+"\" onclick=\"clear_payments("+"document.getElementById('"+output[0]+"').textContent"+","+ "document.getElementById('"+"pay"+output[0]+"').textContent," + "document.getElementById('"+"payadrs"+output[0]+"').textContent"+")\">Pay</button>"+"</td><td>"+btn2+"</td>"+"</tr>";
								$("#_order_table1").find('tbody').append(row);
						}
				});   
			}
		});
	 });
	

});


// Order button action.
function productOrderClick(productId) {
	console.log("order click : " + productId);
	$("#_pid").val(productId);
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


	// Fetching Pending Payments and clearing payments


	function clear_payments(order_id,amount,supplier)
	{
		console.log(order_id+' -> '+amount+' -> ' +supplier)
		web3.eth.getAccounts().then(function (accounts) {
			var account = accounts[0];
		    web3.eth.sendTransaction({
			 from: account,
			 to: supplier,
			 value: web3.utils.toWei(amount, 'ether'),
			   gas:200000
		  },function(err,res)
		   {
			 if(!err){
				contract.methods.updatePayment(account,order_id).send({ from: account }).then(function (output) {
					console.log("#pay"+order_id)
					$("#pay"+order_id).val("");
				});
				alert('Transaction Successful')
			}
			else
				alert('Transaction Failed')
		   });
		});
	}


	// Quantity Accepted by the shipped

	function accepted_qty(accepted_quantity,order_id)
	{
		web3.eth.getAccounts().then(function (accounts) {
			var account = accounts[0];
			return contract.methods.accept_quantity_by_shipper(accepted_quantity,order_id).send({ from: account });
		}).then(function (trx) {
			console.log(trx);
		});
	}


	function generatePDF(_oid) {

web3.eth.getAccounts().then(function (accounts) {
		var account = accounts[0];
		contract.methods.orders(_oid).call().then(function (Order) {
			// console.log(Order)
			console.log("OID: ",_oid)
			var pdf = new jsPDF({
				orientation: 'p',
				unit: 'mm',
				format: 'a4',
				putOnlyUsedFonts:true
				});
            pdf.text(50,30,"INVOICE FOR ORDER : "+_oid)
			var i=10
			for (key in Order){
				if(key >=0 && key<=9)
				   continue
				pdf.text(4,30+i,key+" : "+Order[key])
				console.log(key+" -> "+Order[key])
				i+=10
			}
			
			// pdf.addPage();

			pdf.save("ORDER"+_oid+'reciept.pdf');
		});
		
	});
}
