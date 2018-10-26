
const dbPromise = {
  // create and update db
  db: idb.open('restaurant-reviews-db', 25, function (upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
      case 1:
        upgradeDb.createObjectStore('reviews', { keyPath: 'id' })
        .createIndex('restaurant_id', 'restaurant_id');
    }
  }),

  /**
   * Save restaurant array in idb
   */
   putRestaurants(restaurants, forceUpdate = false) {
     if (!restaurants.push) restaurants = [restaurants];
     return this.db.then(db => {
       const store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
      Promise.all(restaurants.map(networkRestaurant => {
        return store.get(networkRestaurant.id).then(idbRestaurant => {
          if (forceUpdate) return store.put(networkRestaurant);
          if (!idbRestaurant || new Date(networkRestaurant.updatedAt) > new Date(idbRestaurant.updatedAt)) {
            return store.put(networkRestaurant);
          }
        });
      })).then(function () {
        return store.complete;
      });
    });
  },

  /**
   * Get a restaurant by its id
   */
  getRestaurants(id = undefined) {
    return this.db.then(db => {
      const store = db.transaction('restaurants').objectStore('restaurants');
      if (id) return store.get(Number(id));
      return store.getAll();
    });
  },

   /**
    * Put Reviews
    */
   putReviews(reviews) {
     if (!reviews.push) reviews = [reviews];
     return this.db.then(db => {
       const store = db.transaction('reviews', 'readwrite').objectStore('reviews');
       Promise.all(reviews.map(networkReview => {
           return store.get(networkReview.id).then(idbReview => {
             if (!idbReview || new Date(networkReview.updatedAt) > new Date(idbReview.updatedAt)) {
               return store.put(networkReview);
                 }
               });
             })).then(function () {
               return store.complete;
             });
           });
         },

   /**
    * Get
    */
   getReviewsForRestaurant(id) {
     return this.db.then(db => {
       const storeIndex = db.transaction('reviews').objectStore('reviews').index('restaurant_id');
       return storeIndex.getAll(Number(id));
     });
   },

};

export default dbPromise;
