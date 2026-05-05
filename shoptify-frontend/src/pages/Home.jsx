import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/api";
import ProductCard from "../components/ProductCard";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const Home = () => {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      const { data } = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      fetchProducts(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 px-5 mt-20 ">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onDelete={handleDelete}
        />
      ))}
      
    </div>
  );
};

export default Home;