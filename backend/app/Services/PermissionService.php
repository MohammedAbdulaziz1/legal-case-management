<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\User;

class PermissionService
{
    /**
     * Check if user has permission for a module
     */
    public function hasPermission(User $user, string $module, string $action = 'view'): bool
    {
        // Admin has all permissions
        if ($user->role === 'admin') {
            return true;
        }

        $permission = Permission::where('user_id', $user->id)
            ->where('module', $module)
            ->first();

        if (!$permission || !$permission->enabled) {
            return false;
        }

        return match ($action) {
            'view' => $permission->view,
            'add' => $permission->add,
            'edit' => $permission->edit,
            'delete' => $permission->delete,
            default => false,
        };
    }

    /**
     * Get user permissions grouped by module
     */
    public function getUserPermissions(User $user): array
    {
        $permissions = Permission::where('user_id', $user->id)->get();
        
        $grouped = [];
        foreach ($permissions as $permission) {
            $grouped[$permission->module] = [
                'enabled' => $permission->enabled,
                'view' => $permission->view,
                'add' => $permission->add,
                'edit' => $permission->edit,
                'delete' => $permission->delete,
            ];
        }

        return $grouped;
    }

    /**
     * Update user permissions
     */
    public function updateUserPermissions(User $user, array $permissions): void
    {
        foreach ($permissions as $module => $perms) {
            Permission::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'module' => $module,
                ],
                [
                    'enabled' => $perms['enabled'] ?? true,
                    'view' => $perms['view'] ?? false,
                    'add' => $perms['add'] ?? false,
                    'edit' => $perms['edit'] ?? false,
                    'delete' => $perms['delete'] ?? false,
                ]
            );
        }
    }
}

