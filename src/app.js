App = {
	loading: false,
	contracts: {},
	load: async () => {
		await App.loadWeb3();
		await App.loadAccount();
		await App.loadContract();
		await App.render();
		await App.renderTasks();
	},
	loadWeb3: async () => {
		if (window.ethereum) {
	     window.web3 = new Web3(ethereum);
	     try {
	         // Request account access if needed
	         await ethereum.enable();
	         // Acccounts now exposed
	         web3.eth.sendTransaction({/* ... */});
	     } catch (error) {
	         // User denied account access...
	     }
	 }
	 // Legacy dapp browsers...
	 else if (window.web3) {
	     window.web3 = new Web3(web3.currentProvider);
	     // Acccounts always exposed
	     web3.eth.sendTransaction({/* ... */});
	 }
	 // Non-dapp browsers...
	 else {
	     console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
	 }
	},
	loadAccount: async () => {
		await web3.eth.getAccounts().then(function(result){
			App.account = result[0];
		});  		
	},
	loadContract: async () => {		
		const todoList = await $.getJSON("TodoList.json");
		App.contracts.TodoList = TruffleContract(todoList);		
		App.contracts.TodoList.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
		App.todoList = await App.contracts.TodoList.deployed();		
	},
	render: async () => {
		if (App.loading) return;
		App.setLoading(true);
		$('#account').html(App.account);
		App.setLoading(false);
	},
	createTask: async () => {
		App.setLoading(true);
		const content = $('#newTask').val();
		await App.todoList.createTask(content,{from: App.account});
		window.location.reload();
	},
	toggleCompleted: async (e)=> {
		App.setLoading(true);
		const taskId = e.target.name;
		console.log('rlog','called');
		await App.todoList.toggleCompleted(taskId,{from: App.account});		
		window.location.reload();
	},
	renderTasks: async() => {
		const taskCount = await App.todoList.taskCount();
		const $taskTemplate = $('.taskTemplate');
		for(var i=1;i<=taskCount;i++){
			const task = await App.todoList.tasks(i);
			const taskCompleted = task[2];

			const $newTaskTemplate = $taskTemplate.clone();
			$newTaskTemplate.find('.content').html(task[1]);
			$newTaskTemplate.find('input')
							.prop('name',task[0])
							.prop('checked',taskCompleted)
							.on('click',App.toggleCompleted)
			if (taskCompleted)
				$('#completedTaskList').append($newTaskTemplate);
			else
				$('#taskList').append($newTaskTemplate);

			$newTaskTemplate.show();

		}
	},
	setLoading: (boolean) => {
		App.loading = boolean;
		const loader = $('#loader');
		const content = $('#content');
		if (boolean) {
			loader.show();
			content.hide();
		}else{
			loader.hide();
			content.show();
		}
	}
}

$(()=>{
	$(window).load(()=>{
		App.load();
	})
})