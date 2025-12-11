<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Menu;

class MenuArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_archive_list_restore_and_force_delete()
    {
        // Create an admin user and authenticate
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // Create menus
        $menu1 = Menu::create(['name' => 'Keep', 'url' => '/keep', 'order' => 1, 'is_active' => true]);
        $menu2 = Menu::create(['name' => 'Arch', 'url' => '/arch', 'order' => 2, 'is_active' => true, 'is_archived' => true]);

        // List archived
        $res = $this->getJson('/api/admin/menus/archived');
        $res->assertStatus(200);
        $data = $res->json();
        $this->assertCount(1, $data);
        $this->assertEquals('Arch', $data[0]['name']);

        // Restore
        $res2 = $this->postJson("/api/admin/menus/{$menu2->id}/restore");
        $res2->assertStatus(200);
        $this->assertDatabaseHas('menus', ['id' => $menu2->id, 'is_archived' => false]);

        // Mark again and force-delete
        $menu2->update(['is_archived' => true]);
        $res3 = $this->deleteJson("/api/admin/menus/{$menu2->id}/force-delete");
        $res3->assertStatus(200);
        $this->assertDatabaseMissing('menus', ['id' => $menu2->id]);
    }
}
