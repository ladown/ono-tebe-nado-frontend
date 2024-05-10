import { Model } from '../base/Model';
import { ILotItem, LotStatus } from '../../types/index';
import { dayjs, formatNumber } from '../../utils/utils';
import { IEvents } from '../base/events.js';

export class CardModel extends Model<ILotItem> {
	id: string;
	title: string;
	about: string;
	description?: string;
	image: string;
	status: LotStatus;
	datetime: string;
	price: number;
	minPrice: number;
	history?: number[];

	protected myBid: number;

	constructor(data: ILotItem, events: IEvents) {
		super(data, events);

		this.myBid = 0;
	}

	clearBid() {
		this.myBid = 0;
	}

	placeBid(bid: number) {
		this.price = bid;
		this.history = [...this.history, this.myBid];
		this.myBid = bid;

		if (bid > this.minPrice * 10) {
			this.status = 'closed';
		}

		this.emitChanges('auction:changed', { id: this.id, bid });
	}

	get isMyBid(): boolean {
		return this.price === this.myBid;
	}

	get isParticipate(): boolean {
		return this.myBid !== 0;
	}

	get timeStatus(): string {
		if (this.status === 'closed') {
			return 'Акцион завершён';
		} else {
			return dayjs.duration(dayjs(this.datetime).valueOf() - Date.now()).format('D[ д] H[ ч] m[ мин] s[ сек]');
		}
	}

	get statusLabel(): string {
		const formattedDateTime = dayjs(this.datetime).format('D MMMM [в] HH:MM');

		switch (this.status) {
			case 'active':
				return `Открыто до ${formattedDateTime.replace(' в', '')}`;
			case 'wait':
				return `Откроется ${formattedDateTime}`;
			case 'closed':
				return `Закрыто ${formattedDateTime}`;
			default:
				return this.status;
		}
	}

	get auctionStatus(): string {
		switch (this.status) {
			case 'active':
				return `До закрытия лота`;
			case 'wait':
				return `До начала аукциона`;
			case 'closed':
				return `Продано за ${formatNumber(this.price)} ₽`;
			default:
				return '';
		}
	}

	get nextBid(): number {
		return Math.floor(this.price * 1.1);
	}
}
