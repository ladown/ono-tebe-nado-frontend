import { ensureAllElements } from '../../utils/utils';
import { Component } from '../base/Component';

interface ITabs {
	selected: string;
}

interface ITabsActions {
	onClick?: (tab: string) => void;
}

export class Tabs extends Component<ITabs> {
	protected _buttons: HTMLButtonElement[];

	constructor(container: HTMLElement, actions?: ITabsActions) {
		super(container);

		this._buttons = ensureAllElements<HTMLButtonElement>(`.button`, container);

		if (actions?.onClick) {
			this._buttons.forEach((button) => {
				button.addEventListener('click', () => {
					actions.onClick(button.name);
				});
			});
		}
	}

	set selected(name: string) {
		this._buttons.forEach((button) => {
			this.toggleClass(button, 'tabs__item_active', button.name === name);
			this.setDisabled(button, button.name === name);
		});
	}
}
