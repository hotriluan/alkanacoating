<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Product;

class ProductVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_active_products_are_listed()
    {
        // Create active and inactive products
        $active = Product::factory()->create(['is_active' => true]);
        $inactive = Product::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/products');
        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertTrue(collect($data)->contains('id', $active->id));
        $this->assertFalse(collect($data)->contains('id', $inactive->id));
    }

    public function test_featured_only_returns_active_and_featured()
    {
        $featuredActive = Product::factory()->create(['is_active' => true, 'is_featured' => true]);
        $featuredInactive = Product::factory()->create(['is_active' => false, 'is_featured' => true]);

        $response = $this->getJson('/api/products/featured');
        $response->assertStatus(200);
        $ids = collect($response->json())->pluck('id')->toArray();

        $this->assertContains($featuredActive->id, $ids);
        $this->assertNotContains($featuredInactive->id, $ids);
    }

    public function test_show_only_shows_active_product()
    {
        $active = Product::factory()->create(['is_active' => true]);
        $inactive = Product::factory()->create(['is_active' => false]);

        $resp1 = $this->getJson('/api/products/' . $active->slug);
        $resp1->assertStatus(200);

        $resp2 = $this->getJson('/api/products/' . $inactive->slug);
        $resp2->assertStatus(404);
    }
}
