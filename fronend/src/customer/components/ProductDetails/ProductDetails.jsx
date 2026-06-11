import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  ChevronRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/ui/LoadingState";
import EmptyState from "../../../components/ui/EmptyState";
import StarRating from "../../../components/ui/StarRating";
import ProductDetailsGallery from "./ProductDetailsGallery";
import ProductReviewsSection from "./ProductReviewsSection";
import { findProductsById } from "../../../State/Product/Action";
import { addItemToCart } from "../../../State/Cart/Action";
import { findReviews } from "../../../State/Review/Action";
import { fetchRatings } from "../../../State/Rating/Action";
import { classNames } from "../../../utils/classNames";

const TRUST_ITEMS = [
  { icon: TruckIcon, label: "Fast delivery" },
  { icon: ShieldCheckIcon, label: "Secure checkout" },
  { icon: ArrowPathIcon, label: "Easy returns" },
];

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const { productId } = useParams();
  const dispatch = useDispatch();

  const { product: productData, loading } = useSelector((store) => store.products);
  const addingItem = useSelector((store) => store.cart.addingItem);
  const { reviews: reviewList } = useSelector((store) => store.reviews);
  const { ratings: ratingList, totalRating } = useSelector((store) => store.ratings);

  const availableSizes = useMemo(
    () => productData?.sizes?.filter((s) => Number(s.quantity) > 0) || [],
    [productData?.sizes]
  );

  const inStock = (productData?.quantity ?? 0) > 0;
  const hasDiscount =
    productData?.price > 0 &&
    productData?.discountedPrice != null &&
    productData.discountedPrice < productData.price;

  const reviewCount = reviewList?.length ?? 0;
  const ratingValue = Number(totalRating) || 0;

  useEffect(() => {
    dispatch(findReviews(productId));
    dispatch(fetchRatings(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    dispatch(findProductsById({ data: { productId } }));
  }, [dispatch, productId]);

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0].name);
    } else {
      setSelectedSize("");
    }
    setQuantity(1);
  }, [productData?._id, availableSizes]);

  const findRating = (userId) => {
    const found = ratingList?.find((r) => r?.user?._id === userId);
    return found ? found.rating : null;
  };

  const colorSwatch = (name) => {
    const map = {
      black: "#18181b",
      white: "#fafafa",
      gray: "#a1a1aa",
      grey: "#a1a1aa",
      red: "#ef4444",
      blue: "#3b82f6",
      navy: "#1e3a5f",
      green: "#22c55e",
      brown: "#92400e",
      beige: "#d6d3d1",
    };
    return map[String(name || "").toLowerCase()] || "#d4d4d8";
  };

  const addToCart = async () => {
    if (availableSizes.length > 0 && !selectedSize) {
      toast.warning("Please select a size.");
      return false;
    }
    if (!localStorage.getItem("jwt")) {
      toast.warning("Please sign in to add items to your cart.");
      navigate("/login", { state: { from: `/product/${productId}` } });
      return false;
    }

    setAdding(true);
    try {
      await dispatch(
        addItemToCart({
          productId,
          size: selectedSize || availableSizes[0]?.name,
          quantity,
        })
      );
      return true;
    } catch (err) {
      toast.error(err.message || "Could not add item to cart.");
      return false;
    } finally {
      setAdding(false);
    }
  };

  const handleAddToCart = async () => {
    const ok = await addToCart();
    if (ok) {
      toast.success("Added to cart");
      navigate("/cart");
    }
  };

  const handleBuyNow = async () => {
    const ok = await addToCart();
    if (ok) navigate("/checkout");
  };

  const initialProductLoad = loading && !productData;

  if (initialProductLoad) {
    return (
      <div className="page-section bg-surface">
        <LoadingState label="Loading product…" />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="page-section bg-surface">
        <div className="app-container py-16">
          <EmptyState
            title="Product not found"
            description="This item may have been removed or the link is incorrect."
            actionLabel="Browse products"
            onAction={() => navigate("/products")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-section bg-surface">
      <div
        className={classNames(
          "app-container pb-16 pt-4 md:pt-6",
          loading && "pointer-events-none opacity-70"
        )}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-foreground-muted">
            <li>
              <Link to="/" className="transition hover:text-brand-600">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-foreground-subtle">
              <ChevronRightIcon className="h-4 w-4" />
            </li>
            <li>
              <Link to="/products" className="transition hover:text-brand-600">
                Products
              </Link>
            </li>
            {productData.category?.name ? (
              <>
                <li aria-hidden className="text-foreground-subtle">
                  <ChevronRightIcon className="h-4 w-4" />
                </li>
                <li className="font-medium text-foreground">{productData.category.name}</li>
              </>
            ) : null}
          </ol>
        </nav>

        {/* Product hero */}
        <section className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <ProductDetailsGallery product={productData} className="lg:sticky lg:top-24 lg:self-start" />

          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              {productData.brand}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {productData.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StarRating value={ratingValue} showValue />
              <a
                href="#reviews"
                className="text-sm font-medium text-brand-600 transition hover:text-brand-700 hover:underline"
              >
                {reviewCount > 0
                  ? `${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
                  : "Write the first review"}
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                ${productData.discountedPrice ?? productData.price}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-foreground-muted line-through">
                    ${productData.price}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold text-emerald-700">
                    Save {productData.discountedPersent}%
                  </span>
                </>
              )}
            </div>

            <p
              className={classNames(
                "mt-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
                inStock
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              )}
            >
              {inStock ? "In stock" : "Out of stock"}
            </p>

            {productData.color && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground">Color</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-8 w-8 rounded-full border border-line shadow-sm"
                    style={{ backgroundColor: colorSwatch(productData.color) }}
                    title={productData.color}
                  />
                  <span className="text-sm capitalize text-foreground-muted">
                    {productData.color}
                  </span>
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Size</p>
                  <button
                    type="button"
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Size guide
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => setSelectedSize(size.name)}
                      className={classNames(
                        "min-w-[3rem] rounded-xl border px-4 py-2.5 text-sm font-semibold uppercase transition",
                        selectedSize === size.name
                          ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                          : "border-line bg-surface text-foreground hover:border-brand-300"
                      )}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-semibold text-foreground">Quantity</p>
              <div className="mt-2 inline-flex items-center rounded-xl border border-line">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-foreground-muted transition hover:text-foreground"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="min-w-[2.5rem] text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center text-foreground-muted transition hover:text-foreground"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="flex-1 !py-3.5"
                disabled={!inStock || adding || addingItem}
                onClick={handleAddToCart}
              >
                {adding || addingItem ? "Adding…" : "Add to cart"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1 !py-3.5"
                disabled={!inStock || adding || addingItem}
                onClick={handleBuyNow}
              >
                Buy now
              </Button>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-line/80 bg-surface-muted/50 px-3 py-2.5 text-xs font-medium text-foreground-muted"
                >
                  <Icon className="h-5 w-5 shrink-0 text-brand-500" />
                  {label}
                </li>
              ))}
            </ul>

            {productData.description && (
              <div className="mt-10 border-t border-line pt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Description
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                  {productData.description}
                </p>
              </div>
            )}
          </div>
        </section>

        <ProductReviewsSection
          productId={productId}
          reviewList={reviewList}
          ratingList={ratingList}
          totalRating={totalRating}
          findRating={findRating}
        />
      </div>
    </div>
  );
}
