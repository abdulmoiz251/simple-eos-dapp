
  /**
  * DECLARATION
  */
  // const endpoint = "http://127.0.0.1:8888";
  const endpoint = "http://jungle.atticlab.net:8888";
  
  // const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f' //local
  const chainId = 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473' //jungle
  
  // const contract = "bob";
  const contract = "eostestingab";

  let arRows = [];
  let _eos, _account;
  let scatter;



  /**
  * INITIALIZATION
  */
  const rpc = new eosjs_jsonrpc.JsonRpc(endpoint);

  //network details to which scatter will connect
  const network = ScatterJS.Network.fromJson({
    blockchain: 'eos',
    chainId: chainId,
    host: endpoint,
    port: 8888,
    protocol: 'http'
  });

  ScatterJS.plugins(new ScatterEOS()); //initiating scatter

  try {
    //start to connect to scatter client on user's pc
    ScatterJS.scatter.connect(contract).then(connected => {

      // User does not have Scatter Desktop, Mobile or Classic installed.
      if (!connected) return alert("Issue Connecting");

      //get scatter in a global var, to use it for later actions
      scatter = ScatterJS.scatter;

      const requiredFields = {
          accounts: [network]
      };

      //get the user account's identity, show popup if its not connected yet
      scatter.getIdentity(requiredFields).then(async () => {
        _account = scatter.identity.accounts.find(
            x => x.blockchain === "eos" //get only eos bc accounts, because scatter is also used for other bcs as well other than eos 
        )
        // console.log(_account);

        _eos = scatter.eos(network, eosjs_api.Api, {rpc});
        initialize()
      });

      window.ScatterJS = null; //after getiing details nullify scatter objecct, for security
    });
  }
  catch (error) {
    console.log(error);
  }



  /**
  * METHODS
  */

  async function initialize () {
    let account = await getAccountDetails(_account.name)
    let rows = await getTableRows()

    console.log(account);
    console.log(rows);
    
    $('#lblAccount').text('Account: ' + account.account_name)
    
    $.each(rows.rows, function(i, item) {
      var $tr = $('<tr>').append(
          $('<td>').text(item.ID),
          $('<td>').text(item.secondindex),
          $('<td>').text(item.sender),
          $('<td>').text(item.receiver),
          $('<td>').text(item.tokens),
          $('<td>').text(item.fees),
          $('<td>').text(item.completed)
      )
      .appendTo('#tbl');
    });

    return account
  }


  async function getAccountDetails (p_accountname) {
    let account = await rpc.get_account(p_accountname)
    return account
  }


  async function getTableRows () {
    let rows = await rpc.get_table_rows({
      json: true,
      code: contract,
      scope: contract,
      table: "transfers",
      limit: 10
    })

    return rows
  }