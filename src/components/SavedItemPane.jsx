import { h, Component } from 'preact';
import { log } from '../utils';
import { trackEvent } from '../analytics';
import { itemService } from '../itemService';
import { alertsService } from '../notifications';
import { deferred } from '../deferred';
import { ItemTile } from './ItemTile';

export default class SavedItemPane extends Component {
	constructor(props) {
		super(props);
		this.items = [];
		this.state = {
			searchText: null,
		};
	}
	componentWillUpdate(nextProps) {
		if (this.props.items !== nextProps.items) {
			this.items = Object.values(nextProps.items);
			this.items.sort(function (a, b) {
				return b.updatedOn - a.updatedOn;
			});
		}
	}
	componentDidUpdate(prevProps) {
		if (this.props.isOpen && !prevProps.isOpen) {
			window.searchInput.value = '';
		}
	}
	onCloseIntent() {
		this.props.closeHandler();
	}
	itemClickHandler(item) {
		this.props.itemClickHandler(item);
	}
	itemRemoveBtnClickHandler(item, e) {
		e.stopPropagation();
		this.props.itemRemoveBtnClickHandler(item);
	}
	itemForkBtnClickHandler(item, e) {
		e.stopPropagation();
		this.props.itemForkBtnClickHandler(item);
	}
	keyDownHandler(event) {
		if (!this.props.isOpen) {
			return;
		}

		const isCtrlOrMetaPressed = event.ctrlKey || event.metaKey;
		const isForkKeyPressed = isCtrlOrMetaPressed && event.keyCode === 70;
		const isDownKeyPressed = event.keyCode === 40;
		const isUpKeyPressed = event.keyCode === 38;
		const isEnterKeyPressed = event.keyCode === 13;

		const selectedItemElement = $('.js-saved-item-tile.selected');
		const havePaneItems = $all('.js-saved-item-tile').length !== 0;

		if ((isDownKeyPressed || isUpKeyPressed) && havePaneItems) {
			const method = isDownKeyPressed ? 'nextUntil' : 'previousUntil';

			if (selectedItemElement) {
				selectedItemElement.classList.remove('selected');
				selectedItemElement[method](
					'.js-saved-item-tile:not(.hide)'
				).classList.add('selected');
			} else {
				$('.js-saved-item-tile:not(.hide)').classList.add('selected');
			}
			$('.js-saved-item-tile.selected').scrollIntoView(false);
		}

		if (isEnterKeyPressed && selectedItemElement) {
			const item = this.props.items[selectedItemElement.dataset.itemId];
			console.log('opening', item);
			this.props.itemClickHandler(item);
			trackEvent('ui', 'openItemKeyboardShortcut');
		}

		// Fork shortcut inside saved creations panel with Ctrl/⌘ + F
		if (isForkKeyPressed) {
			event.preventDefault();
			const item = this.props.items[selectedItemElement.dataset.itemId];
			this.props.itemForkBtnClickHandler(item);
			trackEvent('ui', 'forkKeyboardShortcut');
		}
	}

	importFileChangeHandler(e) {
		var file = e.target.files[0];

		var reader = new FileReader();
		reader.addEventListener('load', (progressEvent) => {
			var items;
			try {
				items = JSON.parse(progressEvent.target.result);
				log(items);
				this.props.mergeImportedItems(items);
			} catch (exception) {
				log(exception);
				alert(
					'Oops! Selected file is corrupted. Please select a file that was generated by clicking the "Export" button.'
				);
			}
		});

		reader.readAsText(file, 'utf-8');
	}

	importBtnClickHandler(e) {
		var input = document.createElement('input');
		input.type = 'file';
		input.style.display = 'none';
		input.accept = 'accept="application/json';
		document.body.appendChild(input);
		input.addEventListener('change', this.importFileChangeHandler.bind(this));
		input.click();
		trackEvent('ui', 'importBtnClicked');
		e.preventDefault();
	}

	async searchInputHandler(e) {
		console.log('search input handler');
		const text = e.target.value;
		await this.setState({
			searchText: text,
		});
		trackEvent('ui', 'searchInputType');
	}

	filteredItems() {
		return this.items.filter(
			(item) =>
				!this.state.searchText ||
				item.title.toLowerCase().indexOf(this.state.searchText) !== -1
		);
	}

	render() {
		return (
			<div
				id="js-saved-items-pane"
				class={`saved-items-pane ${this.props.isOpen ? 'is-open' : ''}`}
				onKeyDown={this.keyDownHandler.bind(this)}
			>
				<button
					onClick={this.onCloseIntent.bind(this)}
					class="btn icon-button modal__close-btn"
					id="js-saved-items-pane-close-btn"
				>
					<span class="material-symbols-outlined">close</span>
				</button>
				<div class="flex flex-v-center header-container">
					<h3>My Library ({this.items.length})</h3>
					<div className="my-library-buttons">
						<button
							onClick={this.props.exportBtnClickHandler}
							class="btn--dark hint--bottom-left hint--rounded hint--medium icon-button"
							aria-label="Export all your creations into a single importable file."
						>
							<span class="material-symbols-outlined">file_download</span>
							<span>Export</span>
						</button>
						<button
							onClick={this.importBtnClickHandler.bind(this)}
							class="btn--dark hint--bottom-left hint--rounded hint--medium icon-button"
							aria-label="Import your creations. Only the file that you export through the 'Export' button can be imported."
						>
							<span class="material-symbols-outlined">file_upload</span>
							<span>Import</span>
						</button>
					</div>
				</div>
				<input
					id="searchInput"
					class="search-input"
					onInput={this.searchInputHandler.bind(this)}
					placeholder="Search your creations here..."
				/>

				<div id="js-saved-items-wrap" class="saved-items-pane__container">
					{!this.filteredItems().length && this.items.length ? (
						<div class="mt-1">No match found.</div>
					) : null}
					{this.filteredItems().map((item) => (
						<ItemTile
							item={item}
							onClick={this.itemClickHandler.bind(this, item)}
							onForkBtnClick={this.itemForkBtnClickHandler.bind(this, item)}
							onRemoveBtnClick={this.itemRemoveBtnClickHandler.bind(this, item)}
						/>
					))}
					{!this.items.length ? (
						<h2 class="opacity--30">Nothing saved here.</h2>
					) : null}
				</div>
			</div>
		);
	}
}
