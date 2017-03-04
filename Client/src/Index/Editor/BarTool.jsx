import React, {PropTypes} from 'react';
import uuid from 'node-uuid';
import update from 'immutability-helper';
import {default as API} from '../../WebAPI.jsx';
import {
	Button,
	ButtonToolbar,
	ButtonGroup,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	ButtonDropdown
} from 'reactstrap';

const propTypes = {
	fileNew: PropTypes.func.isRequired,
	fileEdit: PropTypes.object.isRequired,
	sourceList: PropTypes.object.isRequired,
	setFileEdit: PropTypes.func.isRequired,
	toggleMainLoader: PropTypes.func.isRequired,
	toggleModalInfo: PropTypes.func.isRequired,
	toggleModalNewFile: PropTypes.func.isRequired,
	getEditorContent: PropTypes.func.isRequired,
};

export default class BarTool extends React.Component{
	constructor (props) {

		super(props);
		this.state = {
			isDropdownOpen: false,
			fileSelect: {
				isSelect: false,
				name: this.props.fileEdit.name,
				owner: '',
				category: '',
				isPub: false
			}
		};
	}

	getFileList(){
		const sl = this.props.sourceList;
		let cmps = [];
		for(const key in sl){
			cmps.push(
				<DropdownItem key={uuid.v4()} header>
					{key}
				</DropdownItem>
			);
			for(const file of sl[key]){
				cmps.push(
					<DropdownItem key={uuid.v4()} onClick={this.setFileSelect.bind(this, file, true)}>
						{`${file.name} @ ${file.owner}`}
					</DropdownItem>
				);
			}
		}
		return cmps;
	}

	setFileSelect(meta, isSelect){
		const n = update(this.state.fileSelect, {
			isSelect: {$set: isSelect},
			name: {$set: meta.name},
			owner: {$set: meta.owner},
			category: {$set: meta.category},
			isPub: {$set: meta.isPublic}
		});
		this.setState({fileSelect: n});
	}

	toggleDropdown(){
		this.setState({
			isDropdownOpen: !this.state.isDropdownOpen
		});
	}

	isFileSelect(){
		return this.state.fileSelect.isSelect;
	}

	isFileOpen(){
		return this.props.fileEdit.isOpen;
	}

	isFileMod(){
		return this.props.fileEdit.isMod;
	}

	clkOpen(){
		this.props.toggleMainLoader(true);
		API.getSourceCode({
			category: this.state.fileSelect.category,
			owner: this.state.fileSelect.owner,
			name: this.state.fileSelect.name
		}, (res)=>{
			this.props.setFileEdit({
				name: {$set: this.state.fileSelect.name},
				category: {$set: this.state.fileSelect.category},
				owner: {$set: this.state.fileSelect.owner},
				isPub: {$set: this.state.fileSelect.isPub},
				isMod: {$set: false},
				isOpen: {$set: true},
				code: {$set: res.data},
				originCode: {$set: res.data}
			});	
		}, (res)=>{
			this.props.toggleModalInfo(true, res.error, 'danger');
		}, (res)=>{
			this.props.toggleMainLoader(false);
		});
	}

	clkSave(){
		this.props.toggleMainLoader(true);
		const content = this.props.getEditorContent();
		API.setSourceCode({
			name: this.props.fileEdit.name,
			owner: this.props.fileEdit.owner,
			category: this.props.fileEdit.category,
			content: content
		}, (res)=>{
			this.props.setFileEdit({
				isMod: {$set: false},
				code: {$set: content},
				originCode: {$set: content}
			});
			this.props.toggleModalInfo(true, 'Save complete.', 'success', false, '');
		}, (res)=>{
			this.props.toggleModalInfo(true, 'Save fail.', 'danger', true, res.error);
		}, (res)=>{
			this.props.toggleMainLoader(false);
		});
	}

	clkCompile(){
		if(this.isFileMod()){
			this.props.toggleModalInfo(true, 'Please save file.', 'warning', false, '');
			return;
		}
		this.props.toggleMainLoader(true);
		API.compile({
			owner: this.props.fileEdit.owner,
			name: this.props.fileEdit.name,
			category:this.props.fileEdit.category
		},(res)=>{
			this.props.toggleModalInfo(true, 'Compile complete.', 'success', false, '');
		},(res)=>{
			console.log(res);
			this.props.toggleModalInfo(true, 'Compile fail.', 'danger', true, res.responseJSON.stderr);
		},(res)=>{
			this.props.toggleMainLoader(false);
		});
	}

	clkPub(){

	}

	clkNew(){
		this.props.fileNew(true);
		this.setFileSelect({
			name: '',
			owner: '',
			category: '',
			isPub: false
		}, false);
	}

	clkSaveAs(){
		this.props.toggleModalNewFile(true);
	}

	render(){
		const pubColor = this.props.fileEdit.isPub ? 'primary' : 'secondary';
		return (
			<ButtonToolbar>
				
					<ButtonDropdown isOpen={this.state.isDropdownOpen} toggle={this.toggleDropdown.bind(this)}>
						<DropdownToggle caret>
							{this.state.fileSelect.name === '' ? 'Select File ' : this.state.fileSelect.name}
						</DropdownToggle>
						<DropdownMenu>
							{this.getFileList.apply(this)}
						</DropdownMenu>
					</ButtonDropdown>

					<Button onClick={this.clkOpen.bind(this)} disabled={!this.isFileSelect.apply(this)}>
						<span className="fa fa-pencil-square-o fa-lg"/>{' Open'}
					</Button>
					<Button onClick={this.clkSave.bind(this)} disabled={!this.isFileOpen.apply(this)}>
						<span className="fa fa-save fa-lg"/>{' Save'}
					</Button>
					<Button onClick={this.clkCompile.bind(this)} disabled={!this.isFileOpen.apply(this)}>
						<span className="fa fa-asterisk fa-lg"/>{' Compile'}
					</Button>
					<Button onClick={this.clkPub.bind(this)} color={pubColor} disabled={!this.isFileOpen.apply(this)}>
						<span className="fa fa-group fa-lg"/>{' Publish'}	
					</Button>
					<Button onClick={this.clkNew.bind(this)}>
						<span className="fa fa-file-code-o fa-lg"/>{' New File'}
					</Button>
					<Button onClick={this.clkSaveAs.bind(this)}>
						<span className="fa fa-plus fa-lg"/>{' Save as'}
					</Button>
				
			</ButtonToolbar>
		);
	}
}

BarTool.propTypes = propTypes;