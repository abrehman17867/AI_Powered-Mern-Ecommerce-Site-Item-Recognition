"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button as MuiButton,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "@/lib/navigation";
import Button from "../../components/ui/Button";
import { api } from "../../config/apiConfig";
import { getAllCategories } from "../../State/Category/Action";
import AdminPageHeader from "./ui/AdminPageHeader";
import ConfirmDialog from "./ui/ConfirmDialog";
import { adminToast } from "../../utils/adminToast";

function parentName(categories, parentId) {
  if (!parentId) return "—";
  const p = categories.find((c) => String(c._id) === String(parentId));
  return p ? p.name : "—";
}

export default function CategoriesAdmin() {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("1");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState("1");
  const [editParentId, setEditParentId] = useState("");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/products/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      adminToast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const level1 = useMemo(
    () => categories.filter((c) => c.level === 1).sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );
  const level2 = useMemo(
    () => categories.filter((c) => c.level === 2).sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  useEffect(() => {
    if (level === "1") setParentId("");
  }, [level]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      adminToast.warning("Enter a category name.");
      return;
    }
    const lev = Number(level);
    const body = { name: trimmed, level: lev };
    if (lev > 1) {
      if (!parentId) {
        adminToast.warning("Select a parent category.");
        return;
      }
      body.parentCategoryId = parentId;
    }
    try {
      await api.post("/api/admin/categories", body);
      adminToast.success("Category created.");
      setName("");
      if (lev > 1) setParentId("");
      await load();
      dispatch(getAllCategories());
    } catch (err) {
      adminToast.error(err.response?.data?.error || err.message || "Create failed.");
    }
  };

  const openDeleteConfirm = (id) => {
    setPendingDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const runDeleteCategory = async () => {
    if (!pendingDeleteId) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/api/admin/categories/${pendingDeleteId}`);
      adminToast.success("Category deleted.");
      setDeleteConfirmOpen(false);
      setPendingDeleteId(null);
      await load();
      dispatch(getAllCategories());
    } catch (err) {
      adminToast.error(err.response?.data?.error || err.message || "Delete failed.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    setEditName(row.name || "");
    setEditLevel(String(row.level || 1));
    setEditParentId(row.parentCategory ? String(row.parentCategory) : "");
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditName("");
    setEditLevel("1");
    setEditParentId("");
  };

  const saveEdit = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      adminToast.warning("Enter a category name.");
      return;
    }
    const lev = Number(editLevel);
    const body = { name: trimmed, level: lev };
    if (lev > 1) {
      if (!editParentId) {
        adminToast.warning("Select a parent category.");
        return;
      }
      body.parentCategoryId = editParentId;
    }
    try {
      await api.patch(`/api/admin/categories/${editingId}`, body);
      adminToast.success("Category updated.");
      cancelEdit();
      await load();
      dispatch(getAllCategories());
    } catch (err) {
      adminToast.error(err.response?.data?.error || err.message || "Update failed.");
    }
  };

  const sortedRows = useMemo(
    () =>
      [...categories].sort((a, b) =>
        a.level !== b.level ? a.level - b.level : a.name.localeCompare(b.name)
      ),
    [categories]
  );

  const visibleRows = useMemo(() => {
    return sortedRows.filter((row) => {
      const passLevel =
        levelFilter === "all" ? true : String(row.level) === String(levelFilter);
      const passSearch = row.name.toLowerCase().includes(search.toLowerCase().trim());
      return passLevel && passSearch;
    });
  }, [sortedRows, levelFilter, search]);

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          if (!deleteBusy) {
            setDeleteConfirmOpen(false);
            setPendingDeleteId(null);
          }
        }}
        onConfirm={runDeleteCategory}
        title="Delete category?"
        description="Removing a category can affect navigation and products that reference it. This cannot be undone from the UI."
        confirmLabel="Delete category"
        cancelLabel="Cancel"
        loading={deleteBusy}
        danger
      />
      <AdminPageHeader
        title="Categories"
        subtitle="Level 1 has no parent. Level 2 under level 1; level 3 under level 2. Matches the storefront navigation tree."
        action={
          <Link
            to="/admin/products"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View products
          </Link>
        }
      />
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip size="small" label={`Total ${categories.length}`} />
        <Chip size="small" label={`L1 ${level1.length}`} />
        <Chip size="small" label={`L2 ${level2.length}`} />
        <Chip size="small" label={`L3 ${categories.filter((c) => c.level === 3).length}`} />
      </Stack>

      <Paper component="form" onSubmit={handleCreate} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Add category
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end" }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            required
            inputProps={{ maxLength: 50 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }} required>
            <InputLabel>Level</InputLabel>
            <Select
              label="Level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="3">3</MenuItem>
            </Select>
          </FormControl>
          {level !== "1" && (
            <FormControl size="small" sx={{ minWidth: 220 }} required>
              <InputLabel>Parent</InputLabel>
              <Select
                label="Parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                {(level === "2" ? level1 : level2).map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name} (L{c.level})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button type="submit" disabled={loading}>
            Create
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            size="small"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter level</InputLabel>
            <Select
              label="Filter level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <MenuItem value="all">All levels</MenuItem>
              <MenuItem value="1">Level 1</MenuItem>
              <MenuItem value="2">Level 2</MenuItem>
              <MenuItem value="3">Level 3</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4}>
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && visibleRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  No categories found for this filter.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              visibleRows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>
                    {editingId === row._id ? (
                      <TextField
                        size="small"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        inputProps={{ maxLength: 50 }}
                      />
                    ) : (
                      row.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === row._id ? (
                      <Select
                        size="small"
                        value={editLevel}
                        onChange={(e) => {
                          const nextLevel = e.target.value;
                          setEditLevel(nextLevel);
                          if (nextLevel === "1") setEditParentId("");
                        }}
                      >
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                        <MenuItem value="3">3</MenuItem>
                      </Select>
                    ) : (
                      row.level
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === row._id ? (
                      Number(editLevel) === 1 ? (
                        "—"
                      ) : (
                        <Select
                          size="small"
                          value={editParentId}
                          onChange={(e) => setEditParentId(e.target.value)}
                          sx={{ minWidth: 180 }}
                        >
                          {(Number(editLevel) === 2 ? level1 : level2)
                            .filter((c) => c._id !== row._id)
                            .map((c) => (
                              <MenuItem key={c._id} value={c._id}>
                                {c.name} (L{c.level})
                              </MenuItem>
                            ))}
                        </Select>
                      )
                    ) : (
                      parentName(categories, row.parentCategory)
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editingId === row._id ? (
                      <>
                        <MuiButton
                          size="small"
                          startIcon={<SaveOutlinedIcon />}
                          onClick={saveEdit}
                        >
                          Save
                        </MuiButton>
                        <MuiButton
                          size="small"
                          color="inherit"
                          startIcon={<CloseIcon />}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </MuiButton>
                      </>
                    ) : (
                      <>
                        <MuiButton
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => startEdit(row)}
                        >
                          Edit
                        </MuiButton>
                        <MuiButton
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => openDeleteConfirm(row._id)}
                        >
                          Delete
                        </MuiButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
