//暂时保留，实现ProductLabel后删除
const SubscriptionBadge = ({ user }) => {
	if (!user) return null;

	let badge = null;
	const subscription = user.subscription;
	const isSubscriptionOnGoing = subscription && subscription['ends_at'] == null;
	const isSubscriptionValid = subscription && subscription['ends_at'] !== null && ((new Date(subscription['ends_at']) - new Date()) >= 0);

	if (isSubscriptionOnGoing || isSubscriptionValid) {
		badge = <text id="headerSubscriptionBadge" style="font-size:24px">🎖</text>;
	}

	return badge;
};


export { SubscriptionBadge };


