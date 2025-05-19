/*
  # Create delete_user function

  1. New Function
    - `delete_user` - A function that allows users to delete their own account
  
  2. Security
    - Function is only accessible to authenticated users
    - Users can only delete their own account
*/

-- Create a function to delete a user's own account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Delete the user from auth.users
  -- This is done through a special schema-level permission
  DELETE FROM auth.users
  WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user TO authenticated;