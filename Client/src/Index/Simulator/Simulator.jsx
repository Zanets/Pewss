import React from 'react';
import { Task as WorkflowTask } from './Task/Workflow/Task.jsx'
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import { 
	Input, 
	Button, 
	FormGroup, 
	Label, 
	Table, 
	Modal, 
	ModalHeader, 
	ModalBody, 
	ModalFooter,
	Jumbotron,
	Col
} from 'reactstrap';

import "bootstrap/dist/css/bootstrap.css";
import "./Simulator.css";

export default class Simulator extends React.Component {

	constructor (props) {
		super(props);
		this.state = {
			class_list: this.fixClassName(props.class_list),
			isOpenNewTask:false,
			tasks: []
		};
	}

	fixClassName(raw){
		let fixed = raw;
		for(const cate in fixed){
			fixed[cate].map(v => {
				while(v.name.indexOf('/') >= 0)
					v.name = v.name.replace('/', '.');
				return v;
			});
		}
		return fixed;
	}

	toggleNewTaskModal(isOpen){
		isOpen = isOpen || !this.state.isOpenNewTask;
		this.setState({
			isOpenNewTask: isOpen
		});
	}

	newTask(){
		let tasks = this.state.tasks;
		
		tasks.push({	
			id: uuid.v4(),
			generator: JSON.parse(ReactDOM.findDOMNode(this.refs.igenerator).value),
			scheduler: JSON.parse(ReactDOM.findDOMNode(this.refs.ischeduler).value),
			simulator: JSON.parse(ReactDOM.findDOMNode(this.refs.isimulator).value),
			platform: JSON.parse(ReactDOM.findDOMNode(this.refs.iplatform).value)
		});
		
		this.setState({tasks: tasks});
		this.toggleNewTaskModal(false);
	}

	startAll(){
		for(const task of this.state.tasks)
			this.refs[task.id].start();
	}

	delTask(id){
		const newTasks = this.state.tasks.filter( task => 
			id !== task.id
		);
		this.setState({tasks: newTasks});
	}

	getTaskComponent(){
		return this.state.tasks.map(ele => 
			<Task key={ele.id} ref={ele.id} {...ele} del={this.delTask.bind(this)}/>
		);
	}

	getOptionComponent(arr){
		return arr.map(ele => 
			<option key={uuid.v4()} value={JSON.stringify(ele)}>
				{`${ele.name} @ ${ele.owner}`}
			</option>
		);
	}

	render() {
		const nullTaskHint = this.state.tasks.length === 0 ? 
							<Jumbotron>
								<h2>There is no simulation task.</h2>
								<h5>Press <span className="fa fa-plus fa-1x"/> to create.</h5>
							</Jumbotron> : 
							'';
		return (
			<div className='card card-default'>
				<div className="card-block">
					{/*---------------- modal -------------*/}
					<Button onClick={this.toggleNewTaskModal.bind(this, true)} className="light">
						<span className="fa fa-plus fa-1x"/>
					</Button>
					<Modal isOpen={this.state.isOpenNewTask} toggle={this.toggleNewTaskModal.bind(this)}>
						<ModalHeader>
							{'New Simulation Task'}
						</ModalHeader>
						<ModalBody>
							<FormGroup row>
								<Label sm={3}>{'Generator'}</Label>
								<Col sm={9}>
									<Input type='select' ref="igenerator">
										{this.getOptionComponent(this.state.class_list.generator)}
									</Input>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label sm={3}>{'Platform'}</Label>
								<Col sm={9}>
									<Input type='select' ref="iplatform">
										{this.getOptionComponent(this.state.class_list.platform)}
									</Input>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label sm={3}>{'Simulator'}</Label>
								<Col sm={9}>
									<Input ref="isimulator" type='select'>
										{this.getOptionComponent(this.state.class_list.simulator)}
									</Input>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label sm={3}>{'Scheduler'}</Label>
								<Col sm={9}>
									<Input ref="ischeduler" type='select'>
										{this.getOptionComponent(this.state.class_list.scheduler)}
									</Input>
								</Col>
							</FormGroup>
						 </ModalBody>
						 <ModalFooter>
						  	<Button color='danger' onClick={this.toggleNewTaskModal.bind(this, false)}>
						  		<span className="fa fa-close"/>
						  	</Button>
						  	{' '}
						  	<Button color='primary' onClick={this.newTask.bind(this)}>
						  		<span className="fa fa-check"/>
						  	</Button>
						</ModalFooter>
					</Modal>				
					{/*---------------- task list -------------*/}
					
					<Table hover responsive style={{marginTop: '30px'}}>
		  			<thead>
		  				<tr>
		  					<th>{'Generator'}</th>
		  					<th>{'Platform'}</th>
		  					<th>{'Simulator'}</th>
		  					<th>{'Scheduler'}</th>
		  					<th>{'Operate'}</th>
		  					<th>{'Status'}</th>
		  					<th style={{display:'none'}}></th>
		  				</tr>
		  			</thead>
		  			<tbody>
		  				{this.getTaskComponent()}
		  			</tbody>
		  		</Table>
		  		{nullTaskHint}
		  	</div>
    	</div>
		);
	}
}
