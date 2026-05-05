import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import axios from "axios";

const CategoryProduct = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/category/${categoryName}`
        );
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, [categoryName]);

  const handleDelete = async (id) => {
      try {
        await deleteProduct(id);
        fetchProducts(); // refresh list
      } catch (err) {
        console.error(err);
      }
    };

  return (
    <div className="p-6 mt-13">
      <h1 className="p-6 text-2xl font-semibold mb-4 capitalize">
        {categoryName.replace(/-/g, " ")}
      </h1>

        {products.length === 0 ? (
            <p>No products found</p>
        ) : (
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 px-5 -mt-10">
                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        )}
    </div>
  );
};

export default CategoryProduct;