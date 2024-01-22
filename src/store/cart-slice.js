import { createSlice } from '@reduxjs/toolkit';
import { uiActions } from './ui-slice';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalQuantity: 0,
    changed:false,
  },
  reducers: {
    replaceCart(state, action) {
      state.totalQuantity = action.payload.totalQuantity;
      state.items = action.payload.items;
    },
    addItemToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);
      state.totalQuantity++;
      state.changed=true;
      if (!existingItem) {
        state.items.push({
          id: newItem.id,
          price: newItem.price,
          quantity: 1,
          totalPrice: newItem.price,
          name: newItem.title,
        });
      } else {
        existingItem.quantity++;
        existingItem.totalPrice = existingItem.totalPrice + newItem.price;
      }
    },
    removeItemFromCart(state, action) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      state.totalQuantity--;
      state.changed=true;
      if (existingItem.quantity === 1) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        existingItem.quantity--;
        existingItem.totalPrice=existingItem.totalPrice-existingItem.price;
      }
    },
  },
});

//action creater
export const sendCartData=(cart)=>{
  return async(dispatch)=>{
    dispatch(
      uiActions.showNotification({
        status:'pending',
        title:'Sending...',
        message:'Sending cart data!',
      })
    );

    const sendRequest=async()=>{
      const response=await fetch("https://react-http-1df71-default-rtdb.firebaseio.com/cart.json",{
        method:'PUT',
        body:JSON.stringify({items:cart.items,totalQuantity:cart.totalQuantity}),
      });
      
      if(!response.ok){
        throw new Error("Sending Cart Data failed.");
      }
    }

    try{
      await sendRequest();

      dispatch(uiActions.showNotification({
        status:'success',
        title:'Success!',
        message:'Sent cart data successfully!'
      }))
    }catch(error){
      dispatch(uiActions.showNotification({
        status:'error',
        title:'Error!',
        message:'Sending cart data failed!'
      }))
    }

  };
}

export const fetchCartData=()=>{
  return async(dispatch)=>{
    const fetchData=async()=>{
      const response=await fetch("https://react-http-1df71-default-rtdb.firebaseio.com/cart.json");
      if(!response.ok){
        throw new Error("Couldn't fetch cart data!");
      }
      const data=await response.json();
      return data;
    }
    try{
      const cartData=await fetchData();
      dispatch(cartSlice.actions.replaceCart({
        ...cartData,items:cartData.items || [],
      }));
    }catch(error){
      // dispatch(uiActions.showNotification({
      //   status:'error',
      //   title:'Error!',
      //   message:'Fetching cart data failed!'
      // }))
      console.log("Cannot fetch!");
    }
  }
}

export const cartActions = cartSlice.actions;

export default cartSlice;
