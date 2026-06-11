import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllCategories } from "../../State/Category/Action";
import { findProductsById } from "../../State/Product/Action";
import { api } from "../../config/apiConfig";
import AdminPageHeader from "./ui/AdminPageHeader";
import AdminCard from "./ui/AdminCard";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import { adminToast } from "../../utils/adminToast";
import { classNames } from "../../utils/classNames";

const initialSizes = [
  { name: "S", quantity: 0 },
  { name: "M", quantity: 0 },
  { name: "L", quantity: 0 },
];

const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

function calculateDiscountPercent(priceValue, discountedValue) {
  const price = Number(priceValue);
  const discountedPrice = Number(discountedValue);
  if (!Number.isFinite(price) || !Number.isFinite(discountedPrice) || price <= 0) {
    return "";
  }
  const discount = ((price - discountedPrice) / price) * 100;
  if (!Number.isFinite(discount)) return "";
  return String(Math.max(0, Math.round(discount)));
}

function parentCategoryId(cat) {
  const p = cat.parentCategory;
  if (p == null || p === undefined) return "";
  if (typeof p === "object" && p._id != null) return String(p._id);
  return String(p);
}

function money(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

const CreateProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(productId);
  const fileRef = useRef(null);
  const hydratedRef = useRef(false);

  const [selectImage, setSelectedImage] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [productData, setProductData] = useState({
    photo: "",
    brand: "",
    title: "",
    color: "",
    discountedPrice: "",
    price: "",
    discountedPersent: "",
    size: initialSizes,
    quantity: "",
    description: "",
  });
  const [selectedLevel1Id, setSelectedLevel1Id] = useState("");
  const [selectedLevel2Id, setSelectedLevel2Id] = useState("");
  const [selectedLevel3Id, setSelectedLevel3Id] = useState("");
  const [discountManual, setDiscountManual] = useState(false);

  const dispatch = useDispatch();
  const { categories: categoryList, loading: categoriesLoading } = useSelector((s) => s.categories);
  const { product: loadedProduct, loading: productLoading } = useSelector((s) => s.products);

  const level1Categories = useMemo(
    () => (categoryList || []).filter((c) => c.level === 1),
    [categoryList]
  );

  const level2Categories = useMemo(
    () =>
      (categoryList || []).filter(
        (c) => c.level === 2 && parentCategoryId(c) === selectedLevel1Id
      ),
    [categoryList, selectedLevel1Id]
  );

  const level3Categories = useMemo(
    () =>
      (categoryList || []).filter(
        (c) => c.level === 3 && parentCategoryId(c) === selectedLevel2Id
      ),
    [categoryList, selectedLevel2Id]
  );

  const categoryPath = useMemo(() => {
    const l1 = level1Categories.find((c) => String(c._id) === selectedLevel1Id);
    const l2 = level2Categories.find((c) => String(c._id) === selectedLevel2Id);
    const l3 = level3Categories.find((c) => String(c._id) === selectedLevel3Id);
    return [l1?.name, l2?.name, l3?.name].filter(Boolean);
  }, [
    level1Categories,
    level2Categories,
    level3Categories,
    selectedLevel1Id,
    selectedLevel2Id,
    selectedLevel3Id,
  ]);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    hydratedRef.current = false;
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    dispatch(findProductsById({ data: { productId } }));
  }, [dispatch, productId]);

  useEffect(() => {
    if (!isEdit || !loadedProduct?._id || !categoryList?.length || hydratedRef.current) return;

    const catRef = loadedProduct.category;
    const leafId = catRef?._id != null ? String(catRef._id) : String(catRef || "");
    if (!leafId) return;

    const l3 = categoryList.find((c) => String(c._id) === leafId && c.level === 3);
    if (l3) {
      const l2Id = parentCategoryId(l3);
      setSelectedLevel3Id(String(l3._id));
      setSelectedLevel2Id(l2Id);
      const l2 = categoryList.find((c) => String(c._id) === String(l2Id));
      if (l2) setSelectedLevel1Id(parentCategoryId(l2));
    } else {
      setSelectedLevel3Id(leafId);
    }

    const sizesFromDoc = Array.isArray(loadedProduct.sizes)
      ? loadedProduct.sizes.map((s) => ({
          name: s.name || "",
          quantity: s.quantity ?? "",
        }))
      : initialSizes;

    setProductData({
      photo: loadedProduct.photo || "",
      brand: loadedProduct.brand || "",
      title: loadedProduct.title || "",
      color: loadedProduct.color || "",
      discountedPrice:
        loadedProduct.discountedPrice != null ? String(loadedProduct.discountedPrice) : "",
      price: loadedProduct.price != null ? String(loadedProduct.price) : "",
      discountedPersent:
        loadedProduct.discountedPersent != null ? String(loadedProduct.discountedPersent) : "",
      size: sizesFromDoc.length ? sizesFromDoc : initialSizes,
      quantity: loadedProduct.quantity != null ? String(loadedProduct.quantity) : "",
      description: loadedProduct.description || "",
    });
    setDiscountManual(false);
    setSelectedImage({});
    hydratedRef.current = true;
  }, [isEdit, loadedProduct, categoryList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "discountedPersent") {
      setDiscountManual(value !== "");
      setProductData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (name === "price" || name === "discountedPrice") {
      setProductData((prev) => {
        const next = { ...prev, [name]: value };
        if (!discountManual) {
          next.discountedPersent = calculateDiscountPercent(next.price, next.discountedPrice);
        }
        return next;
      });
      return;
    }
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const applyAutoDiscountPercent = () => {
    setProductData((prev) => ({
      ...prev,
      discountedPersent: calculateDiscountPercent(prev.price, prev.discountedPrice),
    }));
    setDiscountManual(false);
  };

  const handleLevel1Change = (nextId) => {
    setSelectedLevel1Id(nextId);
    setSelectedLevel2Id("");
    setSelectedLevel3Id("");
  };

  const handleLevel2Change = (nextId) => {
    setSelectedLevel2Id(nextId);
    setSelectedLevel3Id("");
  };

  const level1Options = useMemo(
    () => level1Categories.map((c) => ({ value: String(c._id), label: c.name })),
    [level1Categories]
  );

  const level2Options = useMemo(
    () => level2Categories.map((c) => ({ value: String(c._id), label: c.name })),
    [level2Categories]
  );

  const level3Options = useMemo(
    () => level3Categories.map((c) => ({ value: String(c._id), label: c.name })),
    [level3Categories]
  );

  const handleSizeChange = (e, index) => {
    let { name, value } = e.target;
    name === "size_quantity" ? (name = "quantity") : (name = e.target.name);
    const sizes = [...productData.size];
    sizes[index][name] = value;
    setProductData((prev) => ({ ...prev, size: sizes }));
  };

  const addSizeRow = () => {
    setProductData((prev) => ({
      ...prev,
      size: [...prev.size, { name: "", quantity: 0 }],
    }));
  };

  const removeSizeRow = (index) => {
    if (productData.size.length <= 1) return;
    setProductData((prev) => ({
      ...prev,
      size: prev.size.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLevel3Id) {
      adminToast.error("Choose a full category path (department → group → type).");
      return;
    }
    if (!isEdit && !selectImage?.file) {
      adminToast.error("Upload a product image.");
      return;
    }
    if (isEdit && !selectImage?.file && !loadedProduct?.imageUrl) {
      adminToast.error("Add a product image or keep the existing one.");
      return;
    }

    const formData = new FormData();
    if (selectImage?.file) formData.append("photo", selectImage.file);
    formData.append("brand", productData.brand);
    formData.append("title", productData.title);
    formData.append("color", productData.color);
    formData.append("price", productData.price);
    formData.append("discountedPrice", productData.discountedPrice);
    formData.append("quantity", productData.quantity);
    formData.append("discountedPersent", productData.discountedPersent);
    formData.append("description", productData.description);
    formData.append("leafCategoryId", selectedLevel3Id);
    formData.append("size", JSON.stringify(productData.size));

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/api/admin/products/${productId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        adminToast.success("Product updated successfully.");
        setSelectedImage({});
        hydratedRef.current = false;
        dispatch(findProductsById({ data: { productId } }));
      } else {
        await api.post(`/api/admin/products`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        adminToast.success("Product created successfully.");
        setProductData({
          photo: "",
          brand: "",
          title: "",
          color: "",
          discountedPrice: "",
          price: "",
          discountedPersent: "",
          size: initialSizes,
          quantity: "",
          description: "",
        });
        setSelectedLevel1Id("");
        setSelectedLevel2Id("");
        setSelectedLevel3Id("");
        setSelectedImage({});
        setDiscountManual(false);
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        (isEdit ? "Product update failed." : "Product creation failed.");
      adminToast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const pickImage = (file) => {
    if (!file) return;
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      adminToast.error("Use jpg, jpeg, png, or webp.");
      return;
    }
    try {
      const url = URL.createObjectURL(file);
      setSelectedImage({ file, url });
    } catch {
      adminToast.error("Could not preview image.");
    }
  };

  const handleFileChange = (event) => pickImage(event.target.files?.[0]);

  const handleDrop = (event) => {
    event.preventDefault();
    pickImage(event.dataTransfer.files?.[0]);
  };

  const previewSrc = selectImage?.url || loadedProduct?.imageUrl || "";
  const pageBusy = categoriesLoading || (isEdit && productLoading && !loadedProduct?._id);
  const hasDiscount =
    Number(productData.discountedPersent) > 0 &&
    Number(productData.price) > Number(productData.discountedPrice);

  if (pageBusy) {
    return (
      <div className="py-16">
        <LoadingState label={isEdit ? "Loading product…" : "Loading form…"} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      <AdminPageHeader
        title={isEdit ? "Edit product" : "Add product"}
        subtitle="Create a listing that appears on the storefront with correct categories, pricing, and inventory."
        action={
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to products
          </Link>
        }
      />

      {!categoryList?.length ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No categories found. Add level-1 → level-2 → level-3 categories in{" "}
          <Link to="/admin/categories" className="font-semibold underline">
            Categories
          </Link>{" "}
          so products match the storefront mega menu.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left — media & preview */}
        <div className="space-y-6 lg:col-span-4">
          <AdminCard title="Product media" subtitle={isEdit ? "Replace or keep current image" : "Required for new products"}>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={classNames(
                "group flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition",
                previewSrc
                  ? "border-line bg-zinc-50/50 hover:border-brand-300"
                  : "border-brand-200 bg-brand-50/30 hover:border-brand-400 hover:bg-brand-50/50"
              )}
            >
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Product preview"
                  className="mb-4 max-h-56 w-full rounded-lg object-cover shadow-sm ring-1 ring-line"
                />
              ) : (
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line">
                  <CloudArrowUpIcon className="h-10 w-10 text-brand-500" strokeWidth={1.5} />
                </div>
              )}
              <p className="text-sm font-semibold text-foreground">
                {previewSrc ? "Click or drop to replace image" : "Upload product image"}
              </p>
              <p className="mt-1 text-xs text-foreground-muted">JPG, PNG or WebP · max 10MB</p>
            </button>
          </AdminCard>

          <AdminCard title="Storefront preview" subtitle="How shoppers will see it">
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
              <div className="aspect-[4/3] bg-zinc-100">
                {previewSrc ? (
                  <img src={previewSrc} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-400">
                    <PhotoIcon className="h-12 w-12" strokeWidth={1.25} />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                  {productData.brand || "Brand"}
                </p>
                <p className="line-clamp-2 font-semibold text-foreground">
                  {productData.title || "Product title"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-foreground">
                    {money(productData.discountedPrice || productData.price)}
                  </span>
                  {hasDiscount ? (
                    <>
                      <span className="text-sm text-foreground-muted line-through">
                        {money(productData.price)}
                      </span>
                      <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
                        -{productData.discountedPersent}%
                      </span>
                    </>
                  ) : null}
                </div>
                {productData.color ? (
                  <p className="text-xs text-foreground-muted">Color: {productData.color}</p>
                ) : null}
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Right — form sections */}
        <div className="space-y-6 lg:col-span-8">
          <AdminCard title="Basic details" subtitle="Name, brand, and description">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Brand"
                name="brand"
                value={productData.brand}
                onChange={handleChange}
                required
                placeholder="e.g. Nike"
              />
              <Input
                label="Color"
                name="color"
                value={productData.color}
                onChange={handleChange}
                required
                placeholder="e.g. Black"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Product title"
                  name="title"
                  value={productData.title}
                  onChange={handleChange}
                  required
                  placeholder="Clear, descriptive product name"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={5}
                  value={productData.description}
                  onChange={handleChange}
                  required
                  placeholder="Materials, fit, care instructions…"
                  className="ui-input min-h-[120px] resize-y"
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard
            title="Pricing & inventory"
            subtitle="Set list price, sale price, and total stock"
            action={
              <button
                type="button"
                onClick={applyAutoDiscountPercent}
                className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-foreground-muted transition hover:border-brand-200 hover:text-brand-700"
              >
                <ArrowPathIcon className="h-3.5 w-3.5" />
                Auto discount %
              </button>
            }
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                label="List price ($)"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={productData.price}
                onChange={handleChange}
                required
              />
              <Input
                label="Sale price ($)"
                name="discountedPrice"
                type="number"
                min="0"
                step="0.01"
                value={productData.discountedPrice}
                onChange={handleChange}
                required
              />
              <Input
                label="Discount %"
                name="discountedPersent"
                type="number"
                min="0"
                max="100"
                value={productData.discountedPersent}
                onChange={handleChange}
                required
                hint="Auto-calculated or enter manually"
              />
              <Input
                label="Total quantity"
                name="quantity"
                type="number"
                min="0"
                value={productData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </AdminCard>

          <AdminCard
            className="overflow-visible"
            bodyClassName="overflow-visible"
            title="Category"
            subtitle="Must match the storefront mega menu (3 levels)"
            action={
              categoryPath.length ? (
                <div className="flex flex-wrap items-center gap-1">
                  <TagIcon className="h-4 w-4 text-brand-600" />
                  {categoryPath.map((part, i) => (
                    <Fragment key={part}>
                      {i > 0 ? <span className="text-foreground-muted">/</span> : null}
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {part}
                      </span>
                    </Fragment>
                  ))}
                </div>
              ) : null
            }
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <Select
                label="Department"
                value={selectedLevel1Id}
                onChange={handleLevel1Change}
                options={level1Options}
                placeholder="Select department…"
                disabled={!level1Categories.length}
                required
              />
              <Select
                label="Group"
                value={selectedLevel2Id}
                onChange={handleLevel2Change}
                options={level2Options}
                placeholder={selectedLevel1Id ? "Select group…" : "Choose department first"}
                disabled={!selectedLevel1Id || !level2Categories.length}
                required
              />
              <Select
                label="Product type"
                value={selectedLevel3Id}
                onChange={setSelectedLevel3Id}
                options={level3Options}
                placeholder={selectedLevel2Id ? "Select type…" : "Choose group first"}
                disabled={!selectedLevel2Id || !level3Categories.length}
                required
              />
            </div>
            {selectedLevel2Id && level3Categories.length === 0 ? (
              <p className="mt-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
                This group has no leaf categories. Add level-3 types in{" "}
                <Link to="/admin/categories" className="font-semibold underline">
                  Categories
                </Link>
                .
              </p>
            ) : null}
          </AdminCard>

          <AdminCard
            title="Sizes & per-size stock"
            subtitle="Inventory broken down by variant"
            action={
              <button
                type="button"
                onClick={addSizeRow}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                + Add size
              </button>
            }
          >
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-zinc-50/80 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    <th className="px-4 py-3">Size label</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {productData.size.map((size, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-3">
                        <input
                          name="name"
                          value={size.name}
                          onChange={(e) => handleSizeChange(e, index)}
                          required
                          placeholder="S, M, L…"
                          className="ui-input py-2"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name="size_quantity"
                          type="number"
                          min="0"
                          value={size.quantity}
                          onChange={(e) => handleSizeChange(e, index)}
                          required
                          className="ui-input py-2"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeSizeRow(index)}
                          disabled={productData.size.length <= 1}
                          className="text-xs font-medium text-red-600 disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-white/95 px-5 py-4 backdrop-blur-md lg:left-[17.5rem]">
        <div className="admin-content-inner flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-foreground-muted">
            {isEdit ? "Changes publish immediately to the storefront." : "All required fields must be completed."}
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="min-w-[11.5rem]"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" className="min-w-[11.5rem]" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Update product" : "Publish product"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateProductForm;
