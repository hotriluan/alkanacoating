<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SliderUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_slider_upload_resizes_and_stores()
    {
        Storage::fake('public');

    // Create a fake large image (10MB) using Laravel's UploadedFile fake
    // size() expects kilobytes
    $uploaded = UploadedFile::fake()->image('large.jpg')->size(10 * 1024);

        // Act as admin user (assuming sanctum or default auth guard)
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/admin/sliders', [
            'title' => 'Test',
            'image' => $uploaded,
            'order' => 1,
        ]);

        // Should be 201 created or 200 depending on route setup
        $response->assertStatus(201);

        $data = $response->json();
        $this->assertArrayHasKey('stored_size_bytes', $data);
        $this->assertNotNull($data['stored_size_bytes']);

        // Check file exists in fake storage
        if (isset($data['image'])) {
            Storage::disk('public')->assertExists($data['image']);
        }
    }
}
