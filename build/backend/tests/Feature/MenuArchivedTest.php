<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Menu;

class MenuArchivedTest extends TestCase
{
    use RefreshDatabase;

    public function test_archived_menu_lifecycle()
    {
        // Create user and authenticate
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // Create a menu
        $menu = Menu::create(["name" => "Test", "url" => "/test", "order" => 1]);

        // Archive the menu (delete endpoint should mark is_archived true)
        $resp = $this->deleteJson("/api/admin/menus/{$menu->id}");
        $resp->assertStatus(204);

        $this->assertDatabaseHas('menus', ['id' => $menu->id, 'is_archived' => true]);

        // List archived
        $list = $this->getJson('/api/admin/menus/archived');
        $list->assertStatus(200)->assertJsonFragment(['id' => $menu->id]);

        // Restore
        $restore = $this->postJson("/api/admin/menus/{$menu->id}/restore");
        $restore->assertStatus(200)->assertJsonFragment(['id' => $menu->id, 'is_archived' => false]);

        $this->assertDatabaseHas('menus', ['id' => $menu->id, 'is_archived' => false]);

        // Force delete
        // First archive again
        $this->deleteJson("/api/admin/menus/{$menu->id}");
        $force = $this->deleteJson("/api/admin/menus/{$menu->id}/force-delete");
        $force->assertStatus(204);

        $this->assertDatabaseMissing('menus', ['id' => $menu->id]);
    }
}
