<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\Category;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition()
    {
        $name = $this->faker->sentence(3);
        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1000,9999),
            'excerpt' => $this->faker->paragraph(),
            'content' => $this->faker->text(500),
            'category_id' => Category::factory(),
            'is_active' => true,
            'is_featured' => false,
            'meta_title' => $this->faker->sentence(6),
            'meta_description' => $this->faker->sentence(12),
            'features' => null,
            'applications' => null,
            'technical_specs' => null,
        ];
    }
}
