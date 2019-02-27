//__PADDLE_CHECKOUT_URL__ is a placeholder which will be replaced by Webpack
const baseCheckoutUrl = __PADDLE_CHECKOUT_URL__;  //eslint-disable-line

const UpgradeLink = ({ user }) => {
	if (!user) return null;

	const subscription = user.subscription;
	const isSubscriptionOnGoing = subscription && subscription['ends_at'] == null;
	const isSubscriptionValid = subscription && subscription['ends_at'] !== null && ((new Date(subscription['ends_at']) - new Date()) >= 0);

	if (!isSubscriptionOnGoing && !isSubscriptionValid) {
		const upgradeLink = `${baseCheckoutUrl}?passthrough=${user.uid}`;
		return <a id='UpgradeLink' href={upgradeLink} target='_blank'>Upgrade</a>;
	}
};

export { UpgradeLink };