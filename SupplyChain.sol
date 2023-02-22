// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <=0.8.17;

contract MyContract{


//---------------------------------- two factor Auth----------------------------------------------------------
mapping(address => string) internal _2F;

    function isRegisteredFor2F(address _addr) view public returns (bool) {
        if(bytes(_2F[_addr]).length == 0){
            return (false);
        }else{
            return (true);
        }
    }
    
  
    function registerFor2F(string memory _name) public  {
        _2F[msg.sender] = _name;
    }

 function Auth2F(address add,string memory _name) view public returns (bool) {
      if(keccak256(abi.encodePacked(_2F[add]))==keccak256(abi.encodePacked(_name)))
      { 
             return true;
      }
      return false;
    }
//----------------------------------Two Factor Auth Ends Here -------------------------------------------------



















    // Producer list [address and name].
    mapping(address => string) public producers;
    

     //---------------------------------------------------------
    // Products details.
    int public totalProduct = 0;
    struct product{
        int id;
        int price;
        int quantity;
        string product_name;
        address producer_address;
    }

   

    //Mapping for the products
    mapping(int=>product) public products;
     //---------------------------------------------------------


    // Order details
    int public totalOrder = 0;
    
    struct order{
        int id;
        int product_id;
        int quantity;
        string customer_name;
        string status;
        string delivery_address;
        address customer_address;
        address carrier_address;
        int price;
        int pending_payment;
    }

    //mapping for orders
    mapping(int => order) public orders;
    
    
 //--------------------- Acess Specifiers ------------------------------------

    // register producer authentication.  //New Producer is register based on metamask wallet
    modifier reginsterProducerAuth() {
        require(bytes(producers[msg.sender]).length == 0);
        _;
    }
    
    // Add product authentication.
    modifier addProductAuth() {
        require(bytes(producers[msg.sender]).length > 0);
        _;
    }
    
     //---------------- GLobal Count -----------------------------------------

    // for all
    
    function getTotalProduct() view public returns (int) {
        return totalProduct;
    }
    
    function getTotalOrder() view public returns (int) {
        return totalOrder;
    }


// --- ---------------------Carrier Functions (If Any) ------------------------------------------



function updateByCarrier(int idx,string memory acc)  public returns(address,address) {
    if(orders[idx].carrier_address == msg.sender && keccak256(abi.encodePacked("Shipped")) != keccak256(abi.encodePacked(orders[idx].status)))
    {
        orders[idx].status = "Shipped";
    }
    else if(orders[idx].carrier_address == msg.sender && keccak256(abi.encodePacked("Shipped")) == keccak256(abi.encodePacked(orders[idx].status)))
    {
        orders[idx].status = "Delivered";
    }
    return (msg.sender,orders[idx].carrier_address);
}
     



// // mapping(address => order) public carrier_orders;
// function fetch_next_order_detail(int i)view public returns (int, int, int, string memory, string memory,string memory)
// {
//         if(orders[i].carrier_address == msg.sender)
//          return (orders[i].id,orders[i].product_id,orders[i].quantity,orders[i].delivery_address,orders[i].customer_name,orders[i].status);
//         return(0,0,0,"","","");
// }










//----------------------------------------------------------------------

    
    //-----------------   Seller----------------------------------------
    
    
   // checking seller is registered or not
    function isRegistered(address _addr) view public returns (bool) {
        if(bytes(producers[_addr]).length == 0){
            return (false);
        }else{
            return (true);
        }
    }
    
    //registering producer
    function reginsterProducer(string memory _name) public reginsterProducerAuth {
        producers[msg.sender] = _name;
    }
    

    //adding product
    function addProduct(string memory _pname, int _price, int _quantity) public addProductAuth {
        totalProduct += 1;
        products[totalProduct] = product(totalProduct, _price, _quantity, _pname, msg.sender);
    }
    
    //getting count of total product
    function getTotalProduct(address _addr) view public returns (int) {
        int counter = 0;
        for(int i=1; i<=totalProduct;i++){
            if(products[i].producer_address == _addr){
                counter++;
            }
        }
        return (counter);
    }

    //fetching product corresponding to pid
    
    function getNextProduct(address _addr, int _pid) view public returns (int, int, int, string memory, bool) {
        require(_pid <= totalProduct);
        
        if(products[_pid].producer_address == _addr){
            return (products[_pid].id, products[_pid].price, products[_pid].quantity, products[_pid].product_name, true);
        }
        return (0,0, 0, "", false);
    }
    
    //updating price
    function updatePrice(int _pid, int _newPrice) public {
        require(products[_pid].producer_address == msg.sender);
        products[_pid].price = _newPrice;
    }
    
    //fetching total orders count that producer has to cater
    function getMyTotalOrder(address _addr) view public returns (int) {
        int counter = 0;
        for(int i=1; i<=totalOrder; i++){
            if(products[orders[i].product_id].producer_address == _addr){
                counter++;
            }
        }
        return (counter);
    }
    
//fetching next order of seller
    function getMyNextOrderById(address _addr,int _oid) view public returns(int,int,int,string memory,string memory,string memory, bool) {
         require(_oid <= totalOrder);
         if(products[orders[_oid].product_id].producer_address==_addr){
             return (orders[_oid].id, orders[_oid].price, orders[_oid].quantity, orders[_oid].customer_name, orders[_oid].status, orders[_oid].delivery_address, true);
         }
         return (0,0,0,"","","",false);
    }
    
    //updating order status and changing inventory accordingly

    function updateOrderStatus(int _oid, string memory _status,address _carrier) public {
        require(products[orders[_oid].product_id].producer_address == msg.sender);

    // abi.encodePacked returns packed encoding in bytes form
        if (keccak256(abi.encodePacked(_status)) == keccak256(abi.encodePacked("Rejected"))) {
            products[orders[_oid].product_id].quantity+=orders[_oid].quantity;
            orders[_oid].status = _status;
        }else{
            if(keccak256(abi.encodePacked(orders[_oid].status))!=keccak256(abi.encodePacked("Rejected"))&&
            keccak256(abi.encodePacked(_status))==keccak256(abi.encodePacked("Passed To Carrier"))){
                orders[_oid].status = _status;
                orders[_oid].carrier_address = _carrier;
            }
            else if(keccak256(abi.encodePacked(orders[_oid].status))!=keccak256(abi.encodePacked("Rejected"))&&
            keccak256(abi.encodePacked(_status))==keccak256(abi.encodePacked("Delivered"))){
                orders[_oid].status = _status;
                orders[_oid].carrier_address = _carrier;
            }
        }
    }
    
    
    //---------------------------------------------------------
    //----------------- Seller Ends Here ----------------------------------------
    //---------------------------------------------------------



    
    // ---------------------- customer-----------------------------------------------
    
    function getProductById(int _pid) view public returns (int, int, int, string memory) {
        require(_pid <= totalProduct);
        return (products[_pid].id, products[_pid].price, products[_pid].quantity, products[_pid].product_name);
    }
    
    function placeOrder(string memory _cname, string memory _daddress, int _pid, int _quantity) public {
        require(products[_pid].quantity >= _quantity);
        
        totalOrder += 1;
        orders[totalOrder] = order(totalOrder, _pid, _quantity, _cname, "Placed", _daddress, msg.sender,address(0x0),products[_pid].price,products[_pid].price*_quantity);
        products[_pid].quantity -= _quantity;
    }
    
    function getTotalOrder(address _addr) view public returns (int) {
        int counter = 0;
        for(int i=1; i <= totalOrder; i++){
            if(_addr == orders[i].customer_address){
                counter++;
            }
        }
        return (counter);
    }
    
    function fetchNextOrderById(address _addr, int _oid) view public returns (int, int, int, string memory, string memory, string memory, bool){
        require(_oid <= totalOrder);
            if(_addr==orders[_oid].customer_address){
                return (orders[_oid].id, orders[_oid].price, orders[_oid].quantity, orders[_oid].customer_name, orders[_oid].status, orders[_oid].delivery_address, true);
            }
        return (0, 0, 0, "", "", "", false);
    }




// ------------------------------------PAYMENT CLEARANCE SECTION------------------------------------------------------------------




// Payments by shipper to seller on pending orders

   function getShipperNextPendingOrderById(address _addr,int _oid) view public returns(int,int,bytes memory) {
         require(_oid <= totalOrder);
         if(orders[_oid].customer_address==_addr){
             return (_oid,orders[_oid].pending_payment,abi.encodePacked(products[orders[_oid].product_id].producer_address));
         }
         return (-1,-1,"");
    }

    function updatePayment(address _addr,int _oid)  public  {
       require(_oid <= totalOrder);
       if(orders[_oid].customer_address==_addr){
            orders[_oid].pending_payment = 0;
         }
    }





// All pending amount for seller
     function getSellerNextPendingOrderById(address _addr,int _oid) view public returns(int,int) {
         require(_oid <= totalOrder);
         if(products[orders[_oid].product_id].producer_address==_addr){
             return (_oid,orders[_oid].pending_payment);
         }
         return (-1,-1);
    }

// All pending amount to carrier
    
       function getCarrierNextPendingOrderById(address _addr,int _oid) view public returns(int,int,int) {
         require(_oid <= totalOrder);
         if(orders[_oid].carrier_address ==_addr){
             return (_oid,orders[_oid].pending_payment,orders[_oid].quantity);
         }
         return (-1,-1,-1);
    }


       
        function accept_quantity_by_shipper(int accepted_qty,int _oid) public
        {
            require(_oid <= totalOrder);
            require(orders[_oid].quantity>=accepted_qty);
            if(orders[_oid].customer_address == msg.sender){
                orders[_oid].pending_payment = accepted_qty * orders[_oid].price;
                products[orders[_oid].product_id].quantity+=(orders[_oid].quantity - accepted_qty);
                orders[_oid].quantity = accepted_qty;
           }
        }









}