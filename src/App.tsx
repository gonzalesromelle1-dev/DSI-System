import React, { useState, useEffect } from 'react';
import {
  TabType,
  InventoryItem,
  Project,
  PullOutTicket,
  DeploymentTicket,
  ManpowerPositionRate,
} from './types';
import { INITIAL_INVENTORY } from './data/mockInventory';
import { DEFAULT_MANPOWER_RATES } from './data/defaultManpower';
import { getReorderStatus } from './utils/inventoryHelpers';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { InventoryView } from './components/InventoryView';
import { PullOutView } from './components/PullOutView';
import { DeploymentView } from './components/DeploymentView';
import { ProjectsView } from './components/ProjectsView';
import { PurchasesView } from './components/PurchasesView';
import { AddItemModal } from './components/AddItemModal';
import { EditItemModal } from './components/EditItemModal';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { RemoveItemModal } from './components/RemoveItemModal';
import { AddProjectModal } from './components/AddProjectModal';
import { RemoveProjectModal } from './components/RemoveProjectModal';
import { AddPullOutModal } from './components/AddPullOutModal';
import { RemovePullOutModal } from './components/RemovePullOutModal';
import { AddDeploymentModal } from './components/AddDeploymentModal';
import { RemoveDeploymentModal } from './components/RemoveDeploymentModal';
import { ManageManpowerModal } from './components/ManageManpowerModal';

const STORAGE_KEY = 'dsi_inventory_data_v2_user';
const PROJECTS_STORAGE_KEY = 'dsi_inventory_projects_v1';
const PULLOUT_STORAGE_KEY = 'dsi_inventory_pullouts_v1';
const DEPLOYMENT_STORAGE_KEY = 'dsi_inventory_deployment_v1';
const MANPOWER_RATES_STORAGE_KEY = 'dsi_inventory_manpower_rates_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('inventory');

  // Clean inventory state with localStorage persistence
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved inventory', e);
    }
    return INITIAL_INVENTORY;
  });

  // Projects state (starts clean)
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved projects', e);
    }
    return [];
  });

  // Pull Out Tickets state (starts clean)
  const [pullOutTickets, setPullOutTickets] = useState<PullOutTicket[]>(() => {
    try {
      const saved = localStorage.getItem(PULLOUT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved pull out tickets', e);
    }
    return [];
  });

  // Deployment Tickets state (starts clean)
  const [deploymentTickets, setDeploymentTickets] = useState<DeploymentTicket[]>(() => {
    try {
      const saved = localStorage.getItem(DEPLOYMENT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved deployment tickets', e);
    }
    return [];
  });

  // Manpower Position Rates masterlist state
  const [manpowerRates, setManpowerRates] = useState<ManpowerPositionRate[]>(() => {
    try {
      const saved = localStorage.getItem(MANPOWER_RATES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved manpower rates', e);
    }
    return DEFAULT_MANPOWER_RATES;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save inventory', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(PULLOUT_STORAGE_KEY, JSON.stringify(pullOutTickets));
    } catch (e) {
      console.error('Failed to save pull out tickets', e);
    }
  }, [pullOutTickets]);

  useEffect(() => {
    try {
      localStorage.setItem(DEPLOYMENT_STORAGE_KEY, JSON.stringify(deploymentTickets));
    } catch (e) {
      console.error('Failed to save deployment tickets', e);
    }
  }, [deploymentTickets]);

  useEffect(() => {
    try {
      localStorage.setItem(MANPOWER_RATES_STORAGE_KEY, JSON.stringify(manpowerRates));
    } catch (e) {
      console.error('Failed to save manpower rates', e);
    }
  }, [manpowerRates]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isRemoveProjectModalOpen, setIsRemoveProjectModalOpen] = useState(false);
  const [isAddPullOutModalOpen, setIsAddPullOutModalOpen] = useState(false);
  const [isRemovePullOutModalOpen, setIsRemovePullOutModalOpen] = useState(false);
  const [isAddDeploymentModalOpen, setIsAddDeploymentModalOpen] = useState(false);
  const [isRemoveDeploymentModalOpen, setIsRemoveDeploymentModalOpen] = useState(false);
  const [isManageRatesModalOpen, setIsManageRatesModalOpen] = useState(false);
  const [preselectedRestockItemId, setPreselectedRestockItemId] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<InventoryItem | null>(null);

  // Quick filter for reorder needed
  const [filterReorderActive, setFilterReorderActive] = useState(false);

  // Calculate items needing reorder count
  const reorderAlertCount = items.filter((item) => {
    const status = getReorderStatus(item.stockQty, item.minReorderLevel);
    return status === 'reorder_needed' || status === 'out_of_stock';
  }).length;

  // Inventory Handlers
  const handleAddItem = (newItem: InventoryItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  // Project Handlers
  const handleAddProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleDeleteMultipleProjects = (projectIds: string[]) => {
    const set = new Set(projectIds);
    setProjects((prev) => prev.filter((p) => !set.has(p.id)));
  };

  // Deployment Handlers
  const handleAddDeployment = (newTicket: DeploymentTicket) => {
    setDeploymentTickets((prev) => [newTicket, ...prev]);
  };

  const handleDeleteDeployment = (ticketId: string) => {
    setDeploymentTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const handleDeleteMultipleDeployments = (ticketIds: string[]) => {
    const set = new Set(ticketIds);
    setDeploymentTickets((prev) => prev.filter((t) => !set.has(t.id)));
  };

  const handleUpdateDeploymentStatus = (
    ticketId: string,
    status: DeploymentTicket['status']
  ) => {
    setDeploymentTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
  };

  const handleSaveManpowerRates = (newRates: ManpowerPositionRate[]) => {
    setManpowerRates(newRates);
  };

  // Pull Out Handlers
  const handleAddPullOut = (ticket: PullOutTicket) => {
    // 1. Add ticket to records
    setPullOutTickets((prev) => [ticket, ...prev]);

    // 2. Deduct quantities from warehouse stock and record project allocations
    setItems((prevItems) => {
      const lineMap = new Map<string, number>();
      ticket.items.forEach((line) => {
        lineMap.set(line.itemId, (lineMap.get(line.itemId) || 0) + line.quantity);
      });

      return prevItems.map((item) => {
        if (lineMap.has(item.id)) {
          const qtyToDeduct = lineMap.get(item.id)!;
          const newStock = Math.max(0, item.stockQty - qtyToDeduct);

          let allocations = [...(item.projectAllocations || [])];
          const existingAllocIndex = allocations.findIndex((a) => a.projectId === ticket.projectId);

          if (existingAllocIndex >= 0) {
            allocations[existingAllocIndex] = {
              ...allocations[existingAllocIndex],
              quantity: allocations[existingAllocIndex].quantity + qtyToDeduct,
              allocatedDate: ticket.date,
              leadPerson: ticket.requestedBy || allocations[existingAllocIndex].leadPerson,
              location: ticket.projectLocation || allocations[existingAllocIndex].location,
            };
          } else {
            allocations.push({
              projectId: ticket.projectId,
              projectName: ticket.projectName,
              quantity: qtyToDeduct,
              allocatedDate: ticket.date,
              leadPerson: ticket.requestedBy,
              location: ticket.projectLocation,
            });
          }

          return {
            ...item,
            stockQty: newStock,
            projectAllocations: allocations,
            lastUpdated: new Date().toISOString().slice(0, 10),
            notes: `${item.notes ? item.notes + ' | ' : ''}Pull out ${qtyToDeduct} ${item.unit} to ${ticket.projectName} (${ticket.id})`,
          };
        }
        return item;
      });
    });
  };

  const handleDeletePullOut = (ticketId: string, returnStock: boolean) => {
    const ticket = pullOutTickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    if (returnStock) {
      setItems((prevItems) => {
        const lineMap = new Map<string, number>();
        ticket.items.forEach((line) => {
          lineMap.set(line.itemId, (lineMap.get(line.itemId) || 0) + line.quantity);
        });

        return prevItems.map((item) => {
          if (lineMap.has(item.id)) {
            const qtyToReturn = lineMap.get(item.id)!;
            const newStock = item.stockQty + qtyToReturn;

            let allocations = (item.projectAllocations || [])
              .map((alloc) => {
                if (alloc.projectId === ticket.projectId) {
                  return {
                    ...alloc,
                    quantity: Math.max(0, alloc.quantity - qtyToReturn),
                  };
                }
                return alloc;
              })
              .filter((alloc) => alloc.quantity > 0);

            return {
              ...item,
              stockQty: newStock,
              projectAllocations: allocations,
              lastUpdated: new Date().toISOString().slice(0, 10),
              notes: `${item.notes ? item.notes + ' | ' : ''}Canceled pull out ${ticket.id}, restored +${qtyToReturn} ${item.unit}`,
            };
          }
          return item;
        });
      });
    }

    setPullOutTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const handleDeleteMultiplePullOuts = (ticketIds: string[], returnStock: boolean) => {
    ticketIds.forEach((id) => handleDeletePullOut(id, returnStock));
  };

  const handleRestockItem = (itemId: string, additionalQty: number, notes?: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedQty = item.stockQty + additionalQty;
          return {
            ...item,
            stockQty: updatedQty,
            lastUpdated: new Date().toISOString().slice(0, 10),
            notes: notes ? `${item.notes ? item.notes + ' | ' : ''}Restock +${additionalQty}: ${notes}` : item.notes,
          };
        }
        return item;
      })
    );
  };

  const handleReturnStock = (itemId: string, projectId: string, quantityToReturn: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStockQty = item.stockQty + quantityToReturn;

          let updatedAllocations = item.projectAllocations || [];
          if (updatedAllocations.length > 0) {
            updatedAllocations = updatedAllocations
              .map((alloc) => {
                if (alloc.projectId === projectId || (!alloc.projectId && projectId === 'proj-general')) {
                  return {
                    ...alloc,
                    quantity: Math.max(0, alloc.quantity - quantityToReturn),
                  };
                }
                return alloc;
              })
              .filter((alloc) => alloc.quantity > 0);
          }

          return {
            ...item,
            stockQty: newStockQty,
            projectAllocations: updatedAllocations,
            lastUpdated: new Date().toISOString().slice(0, 10),
            notes: `${item.notes ? item.notes + ' | ' : ''}Returned ${quantityToReturn} ${item.unit} to warehouse stock`,
          };
        }
        return item;
      })
    );
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleDeleteMultiple = (itemIds: string[]) => {
    const set = new Set(itemIds);
    setItems((prev) => prev.filter((item) => !set.has(item.id)));
  };

  const handleDeductStock = (itemId: string, deductQty: number, reason: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.stockQty - deductQty);
          return {
            ...item,
            stockQty: newStock,
            lastUpdated: new Date().toISOString().slice(0, 10),
            notes: `${item.notes ? item.notes + ' | ' : ''}Deducted -${deductQty} ${item.unit} (${reason})`,
          };
        }
        return item;
      })
    );
  };

  const handleClearAllInventory = () => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetData = () => {
    handleClearAllInventory();
  };

  // Open restock modal directly on a specific item
  const handleOpenRestockModalFor = (item: InventoryItem) => {
    setPreselectedRestockItemId(item.id);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setPreselectedRestockItemId(null);
    setIsAddModalOpen(true);
  };

  return (
    <div id="app-root-container" className="flex min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'inventory') {
            setFilterReorderActive(false);
          }
        }}
        reorderAlertCount={reorderAlertCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopNav
          currentTab={currentTab}
          reorderCount={reorderAlertCount}
          onQuickFilterReorder={() => {
            setCurrentTab('inventory');
            setFilterReorderActive(true);
          }}
          onResetData={handleResetData}
        />

        {/* Dynamic Views based on active tab */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {currentTab === 'inventory' && (
            <InventoryView
              items={items}
              onOpenAddItemModal={handleOpenAddModal}
              onOpenRemoveItemsModal={() => setIsRemoveModalOpen(true)}
              onOpenRestockModal={handleOpenRestockModalFor}
              onOpenEditModal={(item) => setEditingItem(item)}
              onOpenDetailsModal={(item) => setDetailsItem(item)}
              onDeleteItem={handleDeleteItem}
              activeFilterReorder={filterReorderActive}
              onClearReorderFilter={() => setFilterReorderActive(false)}
            />
          )}

          {currentTab === 'pull_out' && (
            <PullOutView
              tickets={pullOutTickets}
              projects={projects}
              items={items}
              onOpenAddModal={() => setIsAddPullOutModalOpen(true)}
              onOpenRemoveModal={() => setIsRemovePullOutModalOpen(true)}
              onDeleteTicket={handleDeletePullOut}
              onNavigateToInventory={() => setCurrentTab('inventory')}
              onNavigateToProjects={() => setCurrentTab('projects')}
            />
          )}

          {currentTab === 'deployment' && (
            <DeploymentView
              tickets={deploymentTickets}
              projects={projects}
              manpowerRates={manpowerRates}
              onOpenAddModal={() => setIsAddDeploymentModalOpen(true)}
              onOpenRemoveModal={() => setIsRemoveDeploymentModalOpen(true)}
              onOpenManageRates={() => setIsManageRatesModalOpen(true)}
              onDeleteTicket={handleDeleteDeployment}
              onUpdateTicketStatus={handleUpdateDeploymentStatus}
              onNavigateToProjects={() => setCurrentTab('projects')}
              onNavigateToInventory={() => setCurrentTab('inventory')}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              projects={projects}
              items={items}
              pullOutTickets={pullOutTickets}
              deploymentTickets={deploymentTickets}
              onOpenAddProjectModal={() => setIsAddProjectModalOpen(true)}
              onOpenRemoveProjectModal={() => setIsRemoveProjectModalOpen(true)}
              onDeleteProject={handleDeleteProject}
              onNavigateToInventory={() => setCurrentTab('inventory')}
              onOpenAddPullOutForProject={(pId) => {
                setIsAddPullOutModalOpen(true);
              }}
              onOpenAddDeploymentForProject={(pId) => {
                setIsAddDeploymentModalOpen(true);
              }}
            />
          )}

          {currentTab === 'purchases' && (
            <PurchasesView
              items={items}
              onNavigateToInventory={() => setCurrentTab('inventory')}
              onRestockItem={handleOpenRestockModalFor}
            />
          )}
        </main>
      </div>

      {/* Remove / Deduct Items Modal */}
      <RemoveItemModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        items={items}
        onDeleteItem={handleDeleteItem}
        onDeleteMultiple={handleDeleteMultiple}
        onDeductStock={handleDeductStock}
        onClearAllInventory={handleClearAllInventory}
      />

      {/* Add / Restock Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPreselectedRestockItemId(null);
        }}
        onAddItem={handleAddItem}
        onRestockItem={handleRestockItem}
        existingItems={items}
        preselectedItemId={preselectedRestockItemId}
      />

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAddProject={handleAddProject}
        existingProjects={projects}
      />

      {/* Remove Project Modal */}
      <RemoveProjectModal
        isOpen={isRemoveProjectModalOpen}
        onClose={() => setIsRemoveProjectModalOpen(false)}
        projects={projects}
        items={items}
        onDeleteProject={handleDeleteProject}
        onDeleteMultipleProjects={handleDeleteMultipleProjects}
      />

      {/* Add Pull Out Modal */}
      <AddPullOutModal
        isOpen={isAddPullOutModalOpen}
        onClose={() => setIsAddPullOutModalOpen(false)}
        projects={projects}
        inventoryItems={items}
        onAddPullOut={handleAddPullOut}
        existingTickets={pullOutTickets}
        onOpenAddProjectModal={() => {
          setCurrentTab('projects');
          setIsAddProjectModalOpen(true);
        }}
      />

      {/* Remove Pull Out Modal */}
      <RemovePullOutModal
        isOpen={isRemovePullOutModalOpen}
        onClose={() => setIsRemovePullOutModalOpen(false)}
        tickets={pullOutTickets}
        onDeleteTicket={handleDeletePullOut}
        onDeleteMultipleTickets={handleDeleteMultiplePullOuts}
      />

      {/* Add Deployment Modal */}
      <AddDeploymentModal
        isOpen={isAddDeploymentModalOpen}
        onClose={() => setIsAddDeploymentModalOpen(false)}
        projects={projects}
        manpowerRates={manpowerRates}
        existingTickets={deploymentTickets}
        onAddDeployment={handleAddDeployment}
        onOpenManageRates={() => setIsManageRatesModalOpen(true)}
        onOpenAddProjectModal={() => {
          setCurrentTab('projects');
          setIsAddProjectModalOpen(true);
        }}
      />

      {/* Remove Deployment Modal */}
      <RemoveDeploymentModal
        isOpen={isRemoveDeploymentModalOpen}
        onClose={() => setIsRemoveDeploymentModalOpen(false)}
        tickets={deploymentTickets}
        onDeleteTicket={handleDeleteDeployment}
        onDeleteMultipleTickets={handleDeleteMultipleDeployments}
      />

      {/* Manage Manpower Rates Modal */}
      <ManageManpowerModal
        isOpen={isManageRatesModalOpen}
        onClose={() => setIsManageRatesModalOpen(false)}
        rates={manpowerRates}
        onSaveRates={handleSaveManpowerRates}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
      />

      {/* Detailed Item / Project Breakdown Modal */}
      <ItemDetailsModal
        isOpen={!!detailsItem}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onEdit={(item) => setEditingItem(item)}
        onRestock={handleOpenRestockModalFor}
      />
    </div>
  );
}
