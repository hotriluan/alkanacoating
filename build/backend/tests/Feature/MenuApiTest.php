<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Models\Menu;
use App\Models\User;

class MenuApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_update_menu_with_payload()
    {
        // authenticate as admin
        $admin = User::create([
            'name' => 'Test Admin',
            'email' => 'test-admin@example.com',
            'password' => Hash::make('password'),
            'is_admin' => true,
        ]);
        $this->actingAs($admin, 'sanctum');

        // Create menu with payload
        $payload = [
            ['title' => 'Col1', 'links' => [['name' => 'A', 'url' => '/a']]],
        ];

        $res = $this->postJson('/api/admin/menus', [
            'name' => 'Mega Test',
            'url' => '/mega-test',
            'type' => 'mega',
            'payload' => $payload,
            'order' => 5,
            'is_active' => true,
        ]);

        $res->assertStatus(201)->assertJsonFragment(['name' => 'Mega Test', 'type' => 'mega']);

        $menu = Menu::where('url', '/mega-test')->first();
        $this->assertNotNull($menu);
        $this->assertIsArray($menu->payload);
        $this->assertEquals('Col1', $menu->payload[0]['title']);

        // Update
        $res2 = $this->putJson("/api/admin/menus/{$menu->id}", [
            'name' => 'Mega Test Updated',
            'url' => '/mega-test',
            'type' => 'mega',
            'payload' => json_encode($payload),
            'order' => 6,
            'is_active' => false,
        ]);

        $res2->assertStatus(200)->assertJsonFragment(['name' => 'Mega Test Updated']);

        $menu->refresh();
        $this->assertEquals('Mega Test Updated', $menu->name);
        $this->assertFalse($menu->is_active);
    }

    public function test_upload_asset_stores_files_and_returns_urls()
    {
        Storage::fake('public');

        // authenticate as admin
        $admin = User::create([
            'name' => 'Test Admin',
            'email' => 'test-admin2@example.com',
            'password' => Hash::make('password'),
            'is_admin' => true,
        ]);
        $this->actingAs($admin, 'sanctum');

        $file = UploadedFile::fake()->image('logo.png', 600, 600);
        // use normal post so file gets sent as multipart/form-data
        $res = $this->post('/api/admin/menus/upload-asset', [
            'file' => $file,
        ]);

        $res->assertStatus(201)->assertJsonStructure(['filename','url']);
        $data = $res->json();

        Storage::disk('public')->assertExists('menus/' . $data['filename']);
    }
}
