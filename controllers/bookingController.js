const Product = require( "../models/Product");
const Profile = require( "../models/Profile");
const Cart = require( "../models/Cart");
const Stripe = require( 'stripe');
const User = require( "../models/User");

 const getCheckoutSession = async (req, res) => {
    try{
        
        // get current product
        const product = await Product.findById(req.params.id).populate('categories');
        const user = await User.findById(req.params.id);
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode: 'payment',
            success_url: `${process.env.CLIENT_SIDE_URL}/checkout-success`,
            cancel_url: `${req.protocol}://${req.get('host')}/products/${product.id}`,
            customer_email: user.email,
            client_reference_id: req.params.id,
            line_items: [
                {
                    price_data: {
                        currency: 'bdt',
                        unit_amount: product.price * 100,
                        product_data: {
                            name: product.name,
                            description: product.description,
                            images: [product.image]
                        }
                    },
                    quantity: 1
                }
            ]
        })

        // create new order
        const order = new Order({
            product: product._id,
            user: user._id,
            price: price.price,
            session: session.id
        })

        await order.save()
        res.status(200).json({success: true, message: 'Successfully Paid', session})
    }
    catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Failed to create a checkout session"})
    }
}

module.exports = getCheckoutSession;