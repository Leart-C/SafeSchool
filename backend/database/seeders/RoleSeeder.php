<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'attendance.view',
            'attendance.manage',
            'attendance.view-own',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        foreach (UserRole::cases() as $role) {
            Role::findOrCreate($role->value, 'web');
        }

        Role::findByName(UserRole::Admin->value, 'web')->syncPermissions([
            'attendance.view',
            'attendance.manage',
            'attendance.view-own',
        ]);

        Role::findByName(UserRole::Teacher->value, 'web')->syncPermissions([
            'attendance.view',
            'attendance.manage',
        ]);

        Role::findByName(UserRole::Parent->value, 'web')->syncPermissions([
            'attendance.view-own',
        ]);

        Role::findByName(UserRole::Student->value, 'web')->syncPermissions([
            'attendance.view-own',
        ]);
    }
}