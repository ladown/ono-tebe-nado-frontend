import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';

import { IOrderForm } from './types/';

import { EventEmitter } from './components/base/events';

import { Modal } from './components/common/Modal';
import { Notify } from './components/common/Notify';
import { Tabs } from './components/common/Tabs';
import { Basket } from './components/common/Basket';
import { Loader } from './components/common/Loader';

import { CardModel } from './components/models/CardModel.js';
import { AppModel } from './components/models/AppModel';

import { CardCatalog, CardAuction, CardBid } from './components/views/CardView';
import { AuctionView } from './components/views/AuctionView';

import { AuctionAPI } from './components/AuctionAPI';

import { Page } from './components/Page';
import { Order } from './components/Order';

const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL, API_URL);

events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#preview');
const auctionTemplate = ensureElement<HTMLTemplateElement>('#auction');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#bid');
const bidsTemplate = ensureElement<HTMLTemplateElement>('#bids');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const tabsTemplate = ensureElement<HTMLTemplateElement>('#tabs');
const soldTemplate = ensureElement<HTMLTemplateElement>('#sold');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const emptyTemplate = ensureElement<HTMLTemplateElement>('#empty');
const loaderTemplate = ensureElement<HTMLTemplateElement>('#loader');
const errorTemplate = ensureElement<HTMLTemplateElement>('#error');

const appModel = new AppModel({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const tabs = new Tabs(cloneTemplate(tabsTemplate), {
	onClick(name) {
		if (name === 'closed') {
			events.emit('open:basket-closed');
		} else {
			events.emit('open:basket-active');
		}
	},
});
const successSubmit = new Notify(cloneTemplate(successTemplate), {
	onClick() {
		modal.close();
	},
});
const activeBasket = new Basket(
	cloneTemplate(bidsTemplate),
	events,
	new Notify(cloneTemplate(emptyTemplate), {
		onClick() {
			modal.close();
		},
	}).render(),
);
const closedBasket = new Basket(
	cloneTemplate(basketTemplate),
	events,
	new Notify(cloneTemplate(emptyTemplate), {
		onClick() {
			modal.close();
		},
	}).render(),
);
const order = new Order(cloneTemplate(orderTemplate), events);
const loader = new Loader(cloneTemplate(loaderTemplate));

const getLostList = () => {
	page.catalog = [loader.render()];

	api.getLotList()
		.then((result) => {
			appModel.setCatalog(result);
		})
		.catch(() => {
			page.catalog = [
				new Notify(cloneTemplate(errorTemplate), {
					onClick() {
						page.catalog = [loader.render()];
						getLostList();
					},
				}).render({
					buttonText: 'Повторить попытку',
					buttonModifier: 'outline',
					text: 'Нажмите на кнопку, чтобы повторить попытку',
				}),
			];
		});
};

const getLotItem = (item: CardModel, showItem: (item: CardModel) => void) => {
	modal.render({
		content: loader.render({ text: 'Карточка аукциона загружается...' }),
	});

	api.getLotItem(item.id)
		.then((data: CardModel) => {
			item.history = data.history;
			item.description = data.description;

			showItem(item);
		})
		.catch(() => {
			modal.render({
				content: new Notify(cloneTemplate(errorTemplate), {
					onClick() {
						modal.render({
							content: loader.render({ text: 'Карточка аукциона загружается...' }),
						});
						getLotItem(item, showItem);
					},
				}).render({
					buttonText: 'Загрузить карточку аукционно',
					buttonModifier: 'outline',
					text: 'Произошла ошибка при загрузке карточки аукциона, попробуйте еще раз',
				}),
			});
		});
};

const placeBid = (props: CardModel, price: number, auction: AuctionView) => {
	api.placeBid(props.id, { price })
		.then(() => {
			props.placeBid(price);
			auction.render({
				status: props.status,
				time: props.timeStatus,
				history: props.history,
				label: props.auctionStatus,
				nextBid: props.nextBid,
				buttonText: 'Поставить',
				buttonDisableState: false,
			});
		})
		.catch(() => {
			auction.render({
				status: props.status,
				time: props.timeStatus,
				history: props.history,
				label: props.auctionStatus,
				nextBid: props.nextBid,
				buttonText: 'Поставить',
				buttonDisableState: false,
				error: 'Что-то пошло не так, попробуйте поставить ставку еще раз',
			});
		});
};

const orderLots = () => {
	modal.render({
		content: loader.render({
			text: 'Происходит отправка формы...',
		}),
	});
	api.orderLots(appModel.order)
		.then(() => {
			appModel.clearBasket();

			modal.render({
				content: successSubmit.render(),
			});
		})
		.catch(() => {
			modal.render({
				content: new Notify(cloneTemplate(errorTemplate), {
					onClick() {
						modal.render({
							content: loader.render({
								text: 'Происходит отправка формы...',
							}),
						});
						orderLots();
					},
				}).render({
					buttonText: 'Отправить форму повторно',
					text: 'Произошла ошибка при формы заказа, попробуйте еще раз',
				}),
			});
		});
};

events.on('catalog:changed', () => {
	page.catalog = appModel.catalog.map((catalogItem) => {
		const cardCatalog = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
			onClick() {
				appModel.setCardAuction(catalogItem);
			},
		});

		return cardCatalog.render({
			title: catalogItem.title,
			description: catalogItem.about,
			image: catalogItem.image,
			status: {
				status: catalogItem.status,
				label: catalogItem.statusLabel,
			},
		});
	});

	page.counter = appModel.getClosedLots()?.length;
});

events.on('card:show-preview', (item: CardModel) => {
	const showItem = (props: CardModel) => {
		const cardAuction = new CardAuction(cloneTemplate(cardPreviewTemplate));
		const auction = new AuctionView(cloneTemplate(auctionTemplate), {
			onSubmit(price) {
				placeBid(props, price, auction);
			},
		});

		modal.render({
			content: cardAuction.render({
				title: props.title,
				image: props.image,
				description: props.description.split('\n'),
				status: auction.render({
					status: props.status,
					time: props.timeStatus,
					history: props.history,
					label: props.auctionStatus,
					nextBid: props.nextBid,
				}),
			}),
		});

		if (props.status === 'active') {
			auction.focus();
		}
	};

	if (item) {
		getLotItem(item, showItem);
	} else {
		modal.close();
	}
});

events.on('auction:changed', () => {
	const closedLots = appModel.getClosedLots();

	page.counter = closedLots?.length || 0;

	activeBasket.items = appModel.getActiveLots().map((item) => {
		const cardBidActive = new CardBid(cloneTemplate(cardBasketTemplate), {
			onClick() {
				appModel.setCardAuction(item);
			},
		});
		return cardBidActive.render({
			title: item.title,
			image: item.image,
			status: {
				status: item.isMyBid,
				amount: item.price,
			},
		});
	});

	closedBasket.items = closedLots.map((item) => {
		const cardBidActive = new CardBid(cloneTemplate(soldTemplate), {
			onChange(event) {
				const checkbox = event.target as HTMLInputElement;

				appModel.toggleOrderedLot(item.id, checkbox.checked);

				closedBasket.total = appModel.getTotal();
				closedBasket.selected = appModel.order.items;
			},
		});
		return cardBidActive.render({
			title: item.title,
			image: item.image,
			status: {
				status: item.isMyBid,
				amount: item.price,
			},
		});
	});

	closedBasket.selected = appModel.order.items;
	closedBasket.total = 0;
});

events.on('open:basket-active', () => {
	modal.render({
		content: createElement('div', '', [
			tabs.render({
				selected: 'active',
			}),
			activeBasket.render(),
		]),
	});
});

events.on('open:basket-closed', () => {
	modal.render({
		content: createElement('div', '', [
			tabs.render({
				selected: 'closed',
			}),
			closedBasket.render(),
		]),
	});
});

events.on('order:open', () => {
	modal.render({
		content: order.render({
			phone: '',
			email: '',
			valid: false,
			errors: '',
		}),
	});
});

events.on(/^order\..*:change/, (data: { target: HTMLInputElement; field: keyof IOrderForm; value: string }) => {
	appModel.setOrderField(data.target, data.field, data.value);
});

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	order.valid = !email && !phone;
	order.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

events.on('order:submit', () => {
	orderLots();
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

getLostList();
