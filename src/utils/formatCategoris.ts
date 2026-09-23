 const formattedCategoryOptions = (categories) => {
    
    return[
      {
        options: categories?.map((cat: any) => cat.name) || [],
        label: 'categories',
        value: 'Categories',
      }
    ];
  }

  export default formattedCategoryOptions