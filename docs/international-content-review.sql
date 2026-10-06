-- Reviewed English-only content corrections. Run only after schema review and owner approval.
BEGIN;
UPDATE "Dish" SET "descriptionEn" = 'Rinse the red lentils well. Chop the carrot and zucchini into small pieces. Place all ingredients in a saucepan, add water and cook for about 15–20 minutes, until the lentils and vegetables are completely soft. Blend into a smooth soup or puree. If needed, add a little cooking water to reach the desired consistency.' WHERE "id" = 'cmsthtfpi0003fooc102cfp31';
UPDATE "Dish" SET "descriptionEn" = 'Remove the peach skin and stone. If the peach is not very soft, steam it briefly to soften it. Cook the oats in water for about 5–7 minutes, until soft. Combine the peach and oats, then blend to the desired consistency.' WHERE "id" = 'cmsthsxkl0005foss2qls4mj2';
UPDATE "Dish" SET "descriptionEn" = 'Mash the banana thoroughly with a fork into a smooth puree.
Add the egg and milk and mix well.
Add the rolled oats, unsweetened cocoa, cinnamon and baking powder.
Mix and leave for about 5 minutes so the oats can absorb some of the liquid.
Divide the mixture between small silicone moulds.
Bake in a preheated oven at 180°C for about 18–20 minutes, until the muffins are cooked through in the centre.
Allow to cool, then offer soft, small pieces appropriate for your child’s age.' WHERE "id" = 'cmtuiymgy0000jm047iy3d1lq';
UPDATE "Testimonial" SET "contentEn" = 'A very interesting and helpful page. Wishing you success! ❤️❤️' WHERE "id" = 'cmtai27o9001qjv049xjh1ovd';
COMMIT;
